import WebView, { WebViewMessageEvent } from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";

export interface SandboxConsoleEntry {
	type: "log" | "warn" | "error";
	message: string;
}

/** Um requisito marcado pelo `__codap_check` do checkScript. */
export interface SandboxCheck {
	label: string;
	passed: boolean;
}

export interface SandboxRunResult {
	entries: SandboxConsoleEntry[];
	/** `null` quando o checkScript não chamou `__codap_report` nem `__codap_check`. */
	result: { passed: boolean; message: string; checks: SandboxCheck[] } | null;
}

/** Lê a mensagem `codapTerminal` que o documento do sandbox posta ao terminar. */
export function parseSandboxMessage(data: string): SandboxRunResult | null {
	try {
		const parsed = JSON.parse(data);
		if (parsed && parsed.codapTerminal === true && Array.isArray(parsed.entries)) {
			const raw = parsed.result;
			const result =
				raw && typeof raw.passed === "boolean"
					? {
							passed: raw.passed,
							message: String(raw.message ?? ""),
							checks: Array.isArray(raw.checks)
								? raw.checks.map((check: { label: unknown; passed: unknown }) => ({
										label: String(check.label),
										passed: check.passed === true,
									}))
								: [],
						}
					: null;
			return { entries: parsed.entries as SandboxConsoleEntry[], result };
		}
	} catch {
		// Mensagem malformada ou de outra origem: ignora.
	}
	return null;
}

/**
 * Só o próprio documento pode carregar: um link ou `location.href` no código do
 * aluno não tira a WebView do sandbox. O documento de `source={{ html }}` abre
 * como `about:blank` (ou `data:` em algumas versões do Android).
 */
function onlyTheDocument(request: ShouldStartLoadRequest): boolean {
	return request.url === "about:blank" || request.url.startsWith("data:");
}

interface Props {
	/** Documento de `buildSandboxHtmlDocument` (com `blockNetwork` e `loopGuardMs`). */
	html: string;
	onMessage: (event: WebViewMessageEvent) => void;
}

/**
 * WebView que roda código **do aluno** (`code_playground` e `code_editor`):
 * navegação travada no próprio documento, sem acesso a arquivo nem janelas
 * novas, sem cache. Quem usa remonta a cada execução (`key`) e passa um `html`
 * estável entre execuções — um `html` novo recarregaria a página e rodaria o
 * código de novo.
 */
export default function SandboxWebView({ html, onMessage }: Props) {
	return (
		<WebView
			source={{ html }}
			originWhitelist={["about:*", "data:*"]}
			onShouldStartLoadWithRequest={onlyTheDocument}
			javaScriptEnabled={true}
			javaScriptCanOpenWindowsAutomatically={false}
			setSupportMultipleWindows={false}
			allowFileAccess={false}
			allowFileAccessFromFileURLs={false}
			allowUniversalAccessFromFileURLs={false}
			cacheEnabled={false}
			onMessage={onMessage}
			nestedScrollEnabled
		/>
	);
}
