export interface BuildSandboxDocumentOptions {
	html?: string;
	css?: string;
	/** Só JavaScript puro — nunca TypeScript/JSX, não há transpiler embarcado no app. */
	js?: string;
	/** Rótulo traduzido prefixado nas linhas de erro do painel de console. */
	errorLabel?: string;
	/**
	 * Script de correção do `code_playground` e do `code_editor`, autorado
	 * (nunca do aluno). Roda depois do código do aluno e chama
	 * `__codap_report(passed, message?)` ou, para uma lista de requisitos,
	 * `__codap_check(label, passed)` uma vez por requisito; o resultado viaja
	 * junto com o console na mensagem `codapTerminal`.
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
	 * Proteção contra laço infinito no código do aluno: cada `for`/`while` (e o
	 * `while` do fim de um `do`) ganha uma checagem que lança um erro quando a
	 * tarefa em que os laços rodam passa desse tempo (ms). O relógio é por
	 * tarefa, não desde o carregamento: um laço num clique, minutos depois,
	 * ganha o próprio prazo. No Android, um laço preso trava o processo de
	 * renderização (desmontar a WebView não para JavaScript em execução) e, com
	 * `console.log` dentro, inunda o app até ele parar de responder — o
	 * watchdog de fora não basta.
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
//
// Também define a correção (`__codap_report`, `__codap_check`) e a proteção de
// laços. Tudo isso fica travado (`writable: false`, `configurable: false`) e o
// resultado mora numa variável fechada: no `code_editor` o aluno escreve
// JavaScript livre, e um `__codap_report = function () {}` ou um
// `window.__codapResult = { passed: true }` no código dele não pode burlar a
// correção. `Date.now` e `setTimeout` são guardados antes, pelo mesmo motivo.
function buildShimScript(forwardConsole: boolean, loopGuardMessage: string, loopGuardMs: number): string {
	return `
		(function () {
			var result = null;
			var checks = [];
			var now = Date.now;
			var later = window.setTimeout;
			var taskStart = 0;
			function lock(name, value) {
				Object.defineProperty(window, name, { value: value, writable: false, configurable: false });
			}
			lock("__codapConsoleEntries", []);
			lock("__codap_report", function (passed, message) {
				result = { passed: passed === true, message: message == null ? "" : String(message) };
			});
			lock("__codap_check", function (label, passed) {
				checks.push({ label: String(label), passed: passed === true });
				return passed === true;
			});
			lock("__codapResetResult", function () {
				result = null;
				checks = [];
			});
			// Sem __codap_report explícito, a lista de requisitos decide: passa
			// quando todos passam.
			lock("__codapFinishChecks", function () {
				if (result === null && checks.length > 0) {
					result = {
						passed: checks.every(function (check) { return check.passed; }),
						message: ""
					};
				}
			});
			Object.defineProperty(window, "__codapResult", {
				get: function () {
					return result === null
						? null
						: { passed: result.passed, message: result.message, checks: checks.slice() };
				},
				set: function () {},
				configurable: false
			});
			// O prazo conta desde a primeira volta de laço da tarefa atual e
			// zera quando ela acaba (o setTimeout só roda depois dela).
			lock("__codapLoopGuard", function () {
				if (!${loopGuardMs}) return true;
				var t = now();
				if (!taskStart) {
					taskStart = t;
					later(function () { taskStart = 0; }, 0);
				} else if (t - taskStart > ${loopGuardMs}) {
					throw new Error(${JSON.stringify(loopGuardMessage)});
				}
				return true;
			});
		})();
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
		// Erro dentro de código async (inclusive o laço interrompido num
		// "while (…) { await … }") rejeita uma promise e não passa pelo onerror.
		window.addEventListener("unhandledrejection", function (event) {
			if (window.__codapConsoleEntries.length < ${MAX_CONSOLE_ENTRIES} + 20) {
				window.__codapConsoleEntries.push({ type: "error", message: "Uncaught (in promise) " + String(event.reason) });
			}
			event.preventDefault();
		});
	`;
}

/** Fim de uma string/template que começa em `start` (índice depois da aspa final). */
function skipQuoted(code: string, start: number): number {
	const quote = code[start];
	let k = start + 1;
	while (k < code.length && code[k] !== quote) k += code[k] === "\\" ? 2 : 1;
	return k + 1;
}

/** Índice do `)` que fecha o `(` em `open`, pulando strings; -1 se não fechar. */
function matchParen(code: string, open: number): number {
	let depth = 0;
	for (let k = open; k < code.length; k++) {
		const c = code[k];
		if (c === '"' || c === "'" || c === "`") {
			k = skipQuoted(code, k) - 1;
		} else if (c === "(") {
			depth++;
		} else if (c === ")") {
			depth--;
			if (depth === 0) return k;
		}
	}
	return -1;
}

/** Posições dos `;` fora de parênteses, colchetes, chaves e strings. */
function topLevelSemicolons(code: string): number[] {
	const found: number[] = [];
	let depth = 0;
	for (let k = 0; k < code.length; k++) {
		const c = code[k];
		if (c === '"' || c === "'" || c === "`") k = skipQuoted(code, k) - 1;
		else if (c === "(" || c === "[" || c === "{") depth++;
		else if (c === ")" || c === "]" || c === "}") depth--;
		else if (c === ";" && depth === 0) found.push(k);
	}
	return found;
}

/**
 * Proteção de laços — a técnica do "loop protect" do CodePen, adaptada. A
 * checagem vai na **condição** do laço: `while (x)` vira
 * `while (__codapLoopGuard() && (x))` e `for (a; b; c)` vira
 * `for (a; __codapLoopGuard() && (b); c)` (`__codapLoopGuard()` sozinho se a
 * condição for vazia). Assim valem também laços sem chaves (`while (true);`,
 * `for (;;) x++;`) e o `while` do fim de um `do…while` — o que um aluno
 * digitando código livre escreve. `for…in`/`for…of` não têm condição: ganham a
 * checagem no início do corpo, quando ele tem chaves.
 *
 * Um scanner pequeno pula strings, template strings e comentários. Não
 * reconhece expressões regulares: um `while (` dentro de uma regex literal
 * seria alterado. O watchdog de fora continua valendo para o que escapar.
 */
export function protectLoops(code: string): string {
	let out = "";
	let i = 0;
	const n = code.length;
	const isIdent = (c: string | undefined) => c !== undefined && /[A-Za-z0-9_$.]/.test(c);
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
			const stop = skipQuoted(code, i);
			out += code.slice(i, stop);
			i = stop;
			continue;
		}
		const word = /^(for|while)\b/.exec(code.slice(i, i + 6));
		if (word && !isIdent(code[i - 1])) {
			const keyword = word[1];
			const open = skipSpace(i + keyword.length);
			const close = code[open] === "(" ? matchParen(code, open) : -1;
			if (close !== -1) {
				const head = code.slice(i, open + 1);
				const inner = code.slice(open + 1, close);
				if (keyword === "while") {
					out += `${head}__codapLoopGuard() && (${protectLoops(inner)}))`;
					i = close + 1;
					continue;
				}
				const semicolons = topLevelSemicolons(inner);
				if (semicolons.length === 2) {
					const [a, b] = semicolons;
					const condition = inner.slice(a + 1, b);
					const guarded = condition.trim()
						? `__codapLoopGuard() && (${protectLoops(condition)})`
						: " __codapLoopGuard()";
					out += `${head}${protectLoops(inner.slice(0, a))};${guarded};${protectLoops(inner.slice(b + 1))})`;
					i = close + 1;
					continue;
				}
				const body = skipSpace(close + 1);
				if (code[body] === "{") {
					out += code.slice(i, body + 1) + " __codapLoopGuard();";
					i = body + 1;
					continue;
				}
			}
		}
		out += c;
		i++;
	}
	return out;
}

/** Protege também os `<script>` que o aluno escreve dentro do próprio HTML. */
function protectInlineScripts(html: string): string {
	return html.replace(
		/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
		(_, open: string, body: string, close: string) => open + protectLoops(body) + close
	);
}

// Um "</script>" dentro do código (numa string, por exemplo) fecharia o
// <script> no meio e quebraria o resto do documento — inclusive a correção.
// "<\/script>" é a mesma string em JavaScript; em CSS, "<\/style>" também.
function escapeScript(code: string): string {
	return code.replace(/<\/(script)/gi, "<\\/$1");
}

function escapeStyle(code: string): string {
	return code.replace(/<\/(style)/gi, "<\\/$1");
}

// Registrado no <head>, roda no DOMContentLoaded — depois do código do aluno,
// mas fora do caminho dele: um HTML do aluno que termina no meio de uma tag
// (`<input type="email"` sem o `>`) engoliria um <script> posto depois dele no
// <body>, e a correção nunca rodaria. Fica num <script> próprio: um erro de
// sintaxe no checkScript não derruba o envio do resultado. Um erro do
// checkScript ao rodar vira reprovação com a mensagem do erro. O resultado é
// zerado antes: o que o código do aluno tenha reportado não conta.
function buildCheckScript(checkScript: string): string {
	return `
		document.addEventListener("DOMContentLoaded", function () {
			window.__codapResetResult();
			try {
				${checkScript}
			} catch (__codapCheckError) {
				window.__codap_report(false, String(__codapCheckError && __codapCheckError.message || __codapCheckError));
			}
			window.__codapFinishChecks();
		});
	`;
}

// Roda por último, no DOMContentLoaded (registrado no <head>, depois da
// correção — os ouvintes rodam na ordem em que foram registrados): lê
// window.__codapConsoleEntries e injeta um painel no fim do document.body —
// nunca aparece se não houver nenhuma entrada (uma lição sem console.log/erro
// não ganha um painel vazio).
// Também repassa as mesmas entradas via postMessage, se algo estiver ouvindo
// (o TerminalSection do CodeSection) — window.ReactNativeWebView é undefined
// fora de uma WebView RN (ou na própria aba "Web", que não tem onMessage),
// então isso é um no-op silencioso nesses casos; não precisa de opt-in.
function buildConsolePanelScript(errorLabel: string | undefined, consolePanel: boolean): string {
	const labelLiteral = JSON.stringify(errorLabel ?? "Error");
	return `
		document.addEventListener("DOMContentLoaded", function () {
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
		});
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
 * O `code_playground` e o `code_editor` usam o mesmo documento com
 * `checkScript`, `consolePanel: false`, `blockNetwork: true`, `loopGuardMs`
 * e `forwardConsole: false`.
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
		loopGuardMs = 0,
		loopGuardMessage = "Loop interrupted",
		forwardConsole = true,
	} = opts;

	const body = loopGuardMs ? protectInlineScripts(html) : html;
	const script = escapeScript(loopGuardMs ? protectLoops(js) : js);

	return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
${blockNetwork ? `<meta http-equiv="Content-Security-Policy" content="${BLOCK_NETWORK_CSP}">` : ""}
<style>${escapeStyle(css)}</style>
<script>${buildShimScript(forwardConsole, loopGuardMessage, loopGuardMs)}</script>
${checkScript ? `<script>${buildCheckScript(escapeScript(checkScript))}</script>` : ""}
<script>${buildConsolePanelScript(errorLabel, consolePanel)}</script>
</head>
<body>
${body}
${js ? `<script>${script}</script>` : ""}
</body>
</html>`;
}
