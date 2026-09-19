import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import Icon from "../../../components/Icon";
import ThemedTouchableOpacity from "../../../components/themed/ThemedTouchableOpacity";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";

interface ConsoleEntry {
	type: "log" | "warn" | "error";
	message: string;
}

interface Props {
	/** JavaScript puro a rodar — nunca DOM (sem `html`/`css` em `buildSandboxHtmlDocument`). */
	code: string;
	isDarkMode: boolean;
}

type RunStatus = "idle" | "running" | "done" | "timeout";

// Mesma janela 3-5s usada como baseline pro code_playground (Fase 3) no
// roadmap — aqui é só proteção de UX contra um loop infinito acidental no
// conteúdo autorado, não uma preocupação de segurança (o código nunca é do
// aluno, mesma fronteira de confiança da aba "Web" já existente).
const WATCHDOG_MS = 4000;
// Cobre só o agendamento síncrono do script (a mensagem de conclusão chega
// antes do onLoadEnd pra qualquer script síncrono) — não é uma espera por
// trabalho assíncrono real.
const NO_OUTPUT_GRACE_MS = 250;

function parseTerminalMessage(data: string): ConsoleEntry[] | null {
	try {
		const parsed = JSON.parse(data);
		if (
			parsed &&
			parsed.codapTerminal === true &&
			Array.isArray(parsed.entries)
		) {
			return parsed.entries as ConsoleEntry[];
		}
	} catch {
		// Payload malformado ou de outra origem — ignora, não derruba a tela.
	}
	return null;
}

export default function TerminalSection({ code, isDarkMode }: Props) {
	const { t } = useTranslation();
	const [status, setStatus] = useState<RunStatus>("idle");
	const [entries, setEntries] = useState<ConsoleEntry[]>([]);
	const [runKey, setRunKey] = useState(0);

	const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = () => {
		if (watchdogRef.current !== null) clearTimeout(watchdogRef.current);
		if (graceRef.current !== null) clearTimeout(graceRef.current);
		watchdogRef.current = null;
		graceRef.current = null;
	};

	// Não deixa um timer de uma execução anterior disparar depois que o
	// componente já saiu de tela (ex.: aluno avançou pra próxima atividade).
	useEffect(() => clearTimers, []);

	const run = () => {
		clearTimers();
		setEntries([]);
		setStatus("running");
		// Nunca injectJavaScript incremental — remontar via key garante que
		// nenhum estado global (ex.: uma closure/contador) sobra da tentativa
		// anterior pra essa.
		setRunKey((key) => key + 1);
		watchdogRef.current = setTimeout(() => setStatus("timeout"), WATCHDOG_MS);
	};

	const handleMessage = (event: WebViewMessageEvent) => {
		const received = parseTerminalMessage(event.nativeEvent.data);
		if (received === null) return;
		clearTimers();
		setEntries(received);
		setStatus("done");
	};

	const handleLoadEnd = () => {
		// Se nenhuma mensagem chegou logo após o carregamento (o script do
		// usuário já rodou de forma síncrona nesse ponto), é uma execução sem
		// nenhum console.log — não um travamento. Só decide isso se ainda
		// estiver "running": se uma mensagem já chegou (ou o watchdog já
		// disparou), isso vira um no-op.
		graceRef.current = setTimeout(() => {
			setStatus((current) => (current === "running" ? "done" : current));
		}, NO_OUTPUT_GRACE_MS);
	};

	const showOutput = status === "done" || status === "timeout";
	const isRunning = status === "running";

	return (
		<View style={styles.container}>
			<ThemedTouchableOpacity
				theme="primary"
				style={styles.button}
				onPress={run}
				disabled={isRunning}
			>
				<Icon type="ionicon" name="play" color="#fff" size={16} />
				<Text style={styles.buttonText}>
					{isRunning ? t("codeSection.running") : t("codeSection.run")}
				</Text>
				{isRunning && (
					<ActivityIndicator
						size="small"
						color="#fff"
						style={styles.spinner}
					/>
				)}
			</ThemedTouchableOpacity>

			{showOutput && (
				<View
					style={[
						styles.output,
						isDarkMode ? styles.outputDark : styles.outputLight,
					]}
				>
					{status === "timeout" ? (
						<Text style={styles.timeoutText}>
							{t("codeSection.timeout")}
						</Text>
					) : entries.length === 0 ? (
						<Text style={styles.mutedText}>
							{t("codeSection.noOutput")}
						</Text>
					) : (
						entries.map((entry, index) => (
							<Text
								key={index}
								style={[
									styles.line,
									entry.type === "error"
										? styles.errorLine
										: { color: isDarkMode ? "#cccccc" : "#444444" },
								]}
							>
								{entry.message}
							</Text>
						))
					)}
				</View>
			)}

			{status !== "idle" && (
				<View style={styles.hiddenWebView} pointerEvents="none">
					<WebView
						key={runKey}
						source={{ html: buildSandboxHtmlDocument({ js: code }) }}
						javaScriptEnabled={true}
						onMessage={handleMessage}
						onLoadEnd={handleLoadEnd}
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		marginTop: 12,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "flex-start",
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		gap: 8,
	},
	buttonText: {
		color: "#fff",
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	spinner: {
		marginLeft: 4,
	},
	output: {
		marginTop: 8,
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
	},
	// Mesmos tokens de codeArea/codeAreaLight em CodeSection.tsx, pra
	// continuidade visual com o bloco de código logo acima.
	outputDark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
	},
	outputLight: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
	},
	line: {
		fontFamily: "monospace",
		fontSize: 13,
	},
	errorLine: {
		color: "#e05252",
	},
	mutedText: {
		fontFamily: "monospace",
		fontSize: 13,
		color: "#888888",
		fontStyle: "italic",
	},
	timeoutText: {
		fontFamily: "monospace",
		fontSize: 13,
		color: "#e0a552",
	},
	// Fora de tela: nunca width/height 0 (WebView com tamanho zero é pouco
	// confiável no Android — algumas implementações pausam o agendamento de
	// JS pra uma view sem bounds medidos) nem display:"none" (pode colapsar
	// layout do mesmo jeito).
	hiddenWebView: {
		position: "absolute",
		width: 1,
		height: 1,
		opacity: 0,
	},
});
