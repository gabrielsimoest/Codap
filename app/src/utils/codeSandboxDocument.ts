export interface BuildSandboxDocumentOptions {
	html?: string;
	css?: string;
	/** Só JavaScript puro — nunca TypeScript/JSX, não há transpiler embarcado no app. */
	js?: string;
	/** Rótulo traduzido prefixado nas linhas de erro do painel de console. */
	errorLabel?: string;
	/**
	 * Script de correção do `code_playground`, autorado (nunca do aluno). Roda
	 * depois do código do aluno e chama `__codap_report(passed, message?)`; o
	 * resultado viaja junto com o console na mensagem `codapTerminal`.
	 */
	checkScript?: string;
	/**
	 * Anexa o painel de console ao fim da página (padrão `true`, o que a aba
	 * "Web" da teoria mostra). O playground desliga: ele mostra o console fora
	 * da prévia, em componente nativo.
	 */
	consolePanel?: boolean;
	/**
	 * Política de segurança que bloqueia rede (fetch, imagens remotas, CDNs)
	 * e qualquer script que não seja o do próprio documento. Ligada no
	 * playground, onde o código é do aluno; a teoria não precisa.
	 */
	blockNetwork?: boolean;
	/**
	 * Proteção contra laço infinito no código do aluno: cada `for`/`while`/`do`
	 * ganha uma checagem que lança um erro depois desse tempo (ms) de execução.
	 * No Android, um laço preso trava o processo de renderização (desmontar a
	 * WebView não para JavaScript em execução) e, com `console.log` dentro,
	 * inunda o app até ele parar de responder — o watchdog de fora não basta.
	 */
	loopGuardMs?: number;
	/** Texto do erro que interrompe o laço (aparece no console do aluno). */
	loopGuardMessage?: string;
	/**
	 * Repassa o console também ao console nativo da WebView (padrão `true`).
	 * O playground desliga: no Android cada chamada vira uma mensagem para o
	 * processo do app, e um laço com `console.log` o afoga.
	 */
	forwardConsole?: boolean;
}

/** Entradas de console guardadas no máximo — um laço que loga não esgota a memória. */
const MAX_CONSOLE_ENTRIES = 500;

// Injetado no <head>, roda antes de qualquer código do usuário: sobrescreve
// console.* e window.onerror para empilhar entradas em
// window.__codapConsoleEntries, sem nunca lançar e sem depender de
// window.ReactNativeWebView (funciona igual dentro ou fora de uma WebView RN).
// Também define __codap_report, que o checkScript do playground chama.
function buildShimScript(forwardConsole: boolean, loopGuardMessage: string): string {
	return `
		window.__codapConsoleEntries = [];
		window.__codapResult = null;
		window.__codapLoopDeadline = 0;
		window.__codapLoopGuard = function () {
			if (window.__codapLoopDeadline && Date.now() > window.__codapLoopDeadline) {
				throw new Error(${JSON.stringify(loopGuardMessage)});
			}
		};
		window.__codap_report = function (passed, message) {
			window.__codapResult = { passed: passed === true, message: message == null ? "" : String(message) };
		};
		function __codapFormatArgs(args) {
			return Array.prototype.map.call(args, function (arg) {
				return typeof arg === "string" ? arg : JSON.stringify(arg);
			}).join(" ");
		}
		function __codapCapture(type, args) {
			if (window.__codapConsoleEntries.length >= ${MAX_CONSOLE_ENTRIES}) return;
			window.__codapConsoleEntries.push({ type: type, message: __codapFormatArgs(args) });
		}
		var __codapForward = ${forwardConsole ? "true" : "false"};
		var __codapOriginalConsole = {
			log: console.log, info: console.info, warn: console.warn, error: console.error
		};
		console.log = function () { __codapCapture("log", arguments); if (__codapForward) __codapOriginalConsole.log.apply(console, arguments); };
		console.info = function () { __codapCapture("log", arguments); if (__codapForward) __codapOriginalConsole.info.apply(console, arguments); };
		console.warn = function () { __codapCapture("warn", arguments); if (__codapForward) __codapOriginalConsole.warn.apply(console, arguments); };
		console.error = function () { __codapCapture("error", arguments); if (__codapForward) __codapOriginalConsole.error.apply(console, arguments); };
		// Erros ganham uma folga além do limite: o "laço interrompido" chega
		// depois de o laço já ter enchido o console, e é ele que explica o que
		// aconteceu.
		window.onerror = function (message) {
			if (window.__codapConsoleEntries.length < ${MAX_CONSOLE_ENTRIES} + 20) {
				window.__codapConsoleEntries.push({ type: "error", message: String(message) });
			}
			return true;
		};
	`;
}

/**
 * Insere `__codapLoopGuard();` no início do corpo de cada `for (…) {`,
 * `while (…) {` e `do {` — a mesma técnica do "loop protect" do CodePen. Um
 * scanner pequeno pula strings, template strings e comentários; o `while (…);`
 * do fim de um `do…while` fica de fora (não abre bloco). Laços sem chaves não
 * ganham a checagem — o conteúdo do app sempre usa chaves, e o watchdog de
 * fora continua valendo para eles.
 */
export function protectLoops(code: string): string {
	let out = "";
	let i = 0;
	const n = code.length;
	const isIdent = (c: string | undefined) => c !== undefined && /[A-Za-z0-9_$]/.test(c);
	const skipSpace = (from: number) => {
		let k = from;
		while (k < n && /\s/.test(code[k])) k++;
		return k;
	};
	while (i < n) {
		const c = code[i];
		// Comentários e strings passam intactos.
		if (c === "/" && code[i + 1] === "/") {
			const end = code.indexOf("\n", i);
			const stop = end === -1 ? n : end;
			out += code.slice(i, stop);
			i = stop;
			continue;
		}
		if (c === "/" && code[i + 1] === "*") {
			const end = code.indexOf("*/", i + 2);
			const stop = end === -1 ? n : end + 2;
			out += code.slice(i, stop);
			i = stop;
			continue;
		}
		if (c === '"' || c === "'" || c === "`") {
			let k = i + 1;
			while (k < n && code[k] !== c) k += code[k] === "\\" ? 2 : 1;
			out += code.slice(i, k + 1);
			i = k + 1;
			continue;
		}
		const word = /^(for|while|do)\b/.exec(code.slice(i, i + 6));
		if (word && !isIdent(code[i - 1])) {
			const keyword = word[1];
			let k = skipSpace(i + keyword.length);
			if (keyword !== "do") {
				if (code[k] !== "(") {
					out += c;
					i++;
					continue;
				}
				let depth = 0;
				for (; k < n; k++) {
					if (code[k] === "(") depth++;
					else if (code[k] === ")") {
						depth--;
						if (depth === 0) break;
					}
				}
				k = skipSpace(k + 1);
			}
			if (code[k] === "{") {
				out += code.slice(i, k + 1) + " __codapLoopGuard();";
				i = k + 1;
				continue;
			}
		}
		out += c;
		i++;
	}
	return out;
}

// O prazo dos laços começa a contar quando o script do aluno começa a rodar.
function guardedScript(js: string, loopGuardMs: number | undefined): string {
	if (!loopGuardMs) return js;
	return `window.__codapLoopDeadline = Date.now() + ${loopGuardMs};\n${protectLoops(js)}`;
}

// Roda depois do código do aluno, num <script> próprio: um erro no código do
// aluno não impede a correção de rodar. Um erro no próprio checkScript vira
// reprovação com a mensagem do erro, em vez de deixar o resultado vazio.
function buildCheckScript(checkScript: string): string {
	return `
		try {
			${checkScript}
		} catch (__codapCheckError) {
			window.__codap_report(false, String(__codapCheckError && __codapCheckError.message || __codapCheckError));
		}
	`;
}

// Roda por último, depois do <script> do usuário: lê window.__codapConsoleEntries
// e injeta um painel no fim do document.body — nunca aparece se não houver
// nenhuma entrada (uma lição sem console.log/erro não ganha um painel vazio).
// Também repassa as mesmas entradas via postMessage, se algo estiver ouvindo
// (o TerminalSection do CodeSection) — window.ReactNativeWebView é undefined
// fora de uma WebView RN (ou na própria aba "Web", que não tem onMessage),
// então isso é um no-op silencioso nesses casos; não precisa de opt-in.
function buildConsolePanelScript(errorLabel: string | undefined, consolePanel: boolean): string {
	const labelLiteral = JSON.stringify(errorLabel ?? "Error");
	return `
		(function () {
			var entries = window.__codapConsoleEntries || [];
			if (${consolePanel ? "entries.length > 0" : "false"}) {
				var panel = document.createElement("div");
				panel.style.cssText = "margin-top:12px;padding:8px 4px 0;border-top:1px dashed #888;font-family:monospace;font-size:13px;white-space:pre-wrap;";
				entries.forEach(function (entry) {
					var line = document.createElement("div");
					var isError = entry.type === "error";
					line.style.cssText = isError ? "color:#e05252;" : "color:#444;";
					line.textContent = (isError ? ${labelLiteral} + ": " : "") + entry.message;
					panel.appendChild(line);
				});
				document.body.appendChild(panel);
			}
			if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
				window.ReactNativeWebView.postMessage(JSON.stringify({ codapTerminal: true, entries: entries, result: window.__codapResult }));
			}
		})();
	`;
}

// Sem `connect-src`/`img-src` remotos nem scripts externos: o código do aluno
// não consegue fazer fetch, carregar imagem de fora nem puxar uma biblioteca.
// Os <script>/<style> inline do próprio documento continuam liberados.
const BLOCK_NETWORK_CSP =
	"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:";

/**
 * Monta o documento HTML completo para a aba "Web" do CodeSection: HTML +
 * CSS renderizados normalmente, com um bloco JavaScript opcional executado
 * de verdade (console.log e manipulação de DOM refletidos na própria
 * página) e um painel de console/erro simples anexado ao final.
 *
 * Um erro síncrono não capturado dentro do <script> do usuário já dispara
 * window.onerror nativamente (comportamento padrão de qualquer engine JS) —
 * não precisa de try/catch manual envolvendo o código do usuário.
 *
 * O `code_playground` usa o mesmo documento com `checkScript`,
 * `consolePanel: false`, `blockNetwork: true`, `loopGuardMs` e
 * `forwardConsole: false`.
 */
export function buildSandboxHtmlDocument(opts: BuildSandboxDocumentOptions): string {
	const {
		html = "",
		css = "",
		js = "",
		errorLabel,
		checkScript,
		consolePanel = true,
		blockNetwork = false,
		loopGuardMs,
		loopGuardMessage = "Loop interrupted",
		forwardConsole = true,
	} = opts;

	return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
${blockNetwork ? `<meta http-equiv="Content-Security-Policy" content="${BLOCK_NETWORK_CSP}">` : ""}
<style>${css}</style>
<script>${buildShimScript(forwardConsole, loopGuardMessage)}</script>
</head>
<body>
${html}
${js ? `<script>${guardedScript(js, loopGuardMs)}</script>` : ""}
${checkScript ? `<script>${buildCheckScript(checkScript)}</script>` : ""}
<script>${buildConsolePanelScript(errorLabel, consolePanel)}</script>
</body>
</html>`;
}
