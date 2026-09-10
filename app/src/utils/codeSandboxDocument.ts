export interface BuildSandboxDocumentOptions {
	html?: string;
	css?: string;
	/** Só JavaScript puro — nunca TypeScript/JSX, não há transpiler embarcado no app. */
	js?: string;
	/** Rótulo traduzido prefixado nas linhas de erro do painel de console. */
	errorLabel?: string;
}

// Injetado no <head>, roda antes de qualquer código do usuário: sobrescreve
// console.* e window.onerror para empilhar entradas em
// window.__codapConsoleEntries, sem nunca lançar e sem depender de
// window.ReactNativeWebView (funciona igual dentro ou fora de uma WebView RN).
function buildShimScript(): string {
	return `
		window.__codapConsoleEntries = [];
		function __codapFormatArgs(args) {
			return Array.prototype.map.call(args, function (arg) {
				return typeof arg === "string" ? arg : JSON.stringify(arg);
			}).join(" ");
		}
		function __codapCapture(type, args) {
			window.__codapConsoleEntries.push({ type: type, message: __codapFormatArgs(args) });
		}
		var __codapOriginalConsole = {
			log: console.log, info: console.info, warn: console.warn, error: console.error
		};
		console.log = function () { __codapCapture("log", arguments); __codapOriginalConsole.log.apply(console, arguments); };
		console.info = function () { __codapCapture("log", arguments); __codapOriginalConsole.info.apply(console, arguments); };
		console.warn = function () { __codapCapture("warn", arguments); __codapOriginalConsole.warn.apply(console, arguments); };
		console.error = function () { __codapCapture("error", arguments); __codapOriginalConsole.error.apply(console, arguments); };
		window.onerror = function (message) {
			window.__codapConsoleEntries.push({ type: "error", message: String(message) });
			return true;
		};
	`;
}

// Roda por último, depois do <script> do usuário: lê window.__codapConsoleEntries
// e injeta um painel no fim do document.body — nunca aparece se não houver
// nenhuma entrada (uma lição sem console.log/erro não ganha um painel vazio).
function buildConsolePanelScript(errorLabel?: string): string {
	const labelLiteral = JSON.stringify(errorLabel ?? "Error");
	return `
		(function () {
			var entries = window.__codapConsoleEntries || [];
			if (entries.length === 0) return;
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
		})();
	`;
}

/**
 * Monta o documento HTML completo para a aba "Web" do CodeSection: HTML +
 * CSS renderizados normalmente, com um bloco JavaScript opcional executado
 * de verdade (console.log e manipulação de DOM refletidos na própria
 * página) e um painel de console/erro simples anexado ao final.
 *
 * Um erro síncrono não capturado dentro do <script> do usuário já dispara
 * window.onerror nativamente (comportamento padrão de qualquer engine JS) —
 * não precisa de try/catch manual envolvendo o código do usuário.
 */
export function buildSandboxHtmlDocument(opts: BuildSandboxDocumentOptions): string {
	const { html = "", css = "", js = "", errorLabel } = opts;

	return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
<script>${buildShimScript()}</script>
</head>
<body>
${html}
${js ? `<script>${js}</script>` : ""}
<script>${buildConsolePanelScript(errorLabel)}</script>
</body>
</html>`;
}
