import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, DimensionValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { WebViewMessageEvent } from "react-native-webview";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import Icon from "../../../components/Icon";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";
import SandboxWebView, { parseSandboxMessage, type SandboxRunResult } from "./SandboxWebView";
import { ActivityHint, ActivityQuestion, BLANK, BlankBank } from "./theory/ActivityParts";
import LessonScreen from "./theory/LessonScreen";
import { goldLabel, useTheoryPalette } from "./theory/theoryTheme";

/**
 * Sem mensagem de volta nesse prazo, a execução é dada como travada (laço
 * infinito no código montado). Mesma janela do `TerminalSection`.
 */
const WATCHDOG_MS = 4000;
/** Linhas de console mostradas (as últimas). */
const MAX_SHOWN_LINES = 40;

type Language = "HTML" | "CSS" | "JavaScript";
type RunStatus = "idle" | "running" | "done" | "timeout";

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: Language;
	code: string;
	blocks: string[];
	html?: string;
	css?: string;
	js?: string;
	checkScript: string;
	tutorial?: boolean;
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

function shuffled<T>(items: readonly T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Playground guiado (Fase 3a do roadmap): o aluno completa as lacunas tocando
 * em blocos, como no `CodeBlankExercise`, e toca em "Executar" para rodar o
 * código de verdade numa WebView — prévia de HTML/CSS e console embaixo.
 *
 * A correção é pelo **comportamento**: o `checkScript` autorado roda depois do
 * código do aluno e chama `__codap_report(passed, message?)`, então qualquer
 * combinação de blocos que funcione passa. Mudar um bloco invalida o resultado:
 * é preciso executar de novo antes de seguir.
 *
 * Hardening, já que agora o código é do aluno: CSP sem rede
 * (`blockNetwork`), proteção de laços, a `SandboxWebView` (navegação travada
 * no próprio documento, sem acesso a arquivo nem janelas novas) e um watchdog.
 * Cada execução remonta a WebView (`key`), sem estado sobrando da anterior.
 */
export default function CodePlaygroundExercise({
	question,
	highlight = [""],
	codeLanguage,
	code,
	blocks,
	html,
	css,
	js,
	checkScript,
	tutorial = false,
	title,
	step,
	total,
	progress,
	onProceed,
	onClose,
}: Props) {
	const palette = useTheoryPalette();
	const { t } = useTranslation();
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);
	const [modalVisible, setModalVisible] = useState(false);

	// Embaralhado uma vez por atividade (o `ActivityPlayer` remonta a cada uma).
	const [chips] = useState(() => shuffled(blocks));
	const parts = code.split(BLANK);
	const blankCount = parts.length - 1;
	const [slots, setSlots] = useState<(number | null)[]>(() =>
		Array.from({ length: blankCount }, () => null)
	);

	const [status, setStatus] = useState<RunStatus>("idle");
	const [run, setRun] = useState<SandboxRunResult | null>(null);
	const [runKey, setRunKey] = useState(0);
	const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearWatchdog = () => {
		if (watchdog.current !== null) clearTimeout(watchdog.current);
		watchdog.current = null;
	};
	useEffect(() => clearWatchdog, []);

	const filledCode = parts.reduce(
		(acc, part, index) =>
			index === 0
				? part
				: acc + (slots[index - 1] !== null ? chips[slots[index - 1] as number] : BLANK) + part,
		""
	);
	const allFilled = slots.every((slot) => slot !== null);

	// Um resultado vale só para o código que foi executado.
	const changeSlots = (next: (number | null)[]) => {
		clearWatchdog();
		setSlots(next);
		setStatus("idle");
		setRun(null);
	};

	const placeChip = (chipIndex: number) => {
		const empty = slots.indexOf(null);
		if (empty === -1 || slots.includes(chipIndex)) return;
		changeSlots(slots.map((slot, k) => (k === empty ? chipIndex : slot)));
	};

	const clearSlot = (slotIndex: number) => {
		changeSlots(slots.map((slot, k) => (k === slotIndex ? null : slot)));
	};

	const execute = () => {
		if (!allFilled) return;
		clearWatchdog();
		setRun(null);
		setStatus("running");
		setRunKey((key) => key + 1);
		watchdog.current = setTimeout(() => setStatus("timeout"), WATCHDOG_MS);
	};

	const handleMessage = (event: WebViewMessageEvent) => {
		const received = parseSandboxMessage(event.nativeEvent.data);
		if (received === null) return;
		clearWatchdog();
		setRun(received);
		setStatus("done");
	};

	const passed = status === "done" && run?.result?.passed === true;
	// Um laço que loga pode trazer centenas de linhas; as últimas bastam — é
	// nelas que está o erro que interrompeu o laço.
	const allEntries = run?.entries ?? [];
	const shownEntries = allEntries.slice(-MAX_SHOWN_LINES);
	const hiddenLines = allEntries.length - shownEntries.length;
	const evaluated = status === "done" || status === "timeout";

	const documentHtml = buildSandboxHtmlDocument({
		html: codeLanguage === "HTML" ? filledCode : html,
		css: codeLanguage === "CSS" ? filledCode : css,
		js: codeLanguage === "JavaScript" ? filledCode : js,
		checkScript,
		consolePanel: false,
		blockNetwork: true,
		// Laço preso trava o renderizador do Android e afoga o app (ver
		// `loopGuardMs` no codeSandboxDocument): corta em 1 s, bem antes do watchdog.
		loopGuardMs: 1000,
		loopGuardMessage: t("playground.loopInterrupted"),
		forwardConsole: false,
		errorLabel: t("codeSection.consoleError"),
	});
	// JavaScript puro, sem HTML de apoio, não tem o que mostrar na prévia.
	const showPreview = codeLanguage !== "JavaScript" || Boolean(html);

	const resultText = (() => {
		if (status === "timeout") return t("codeSection.timeout");
		if (status !== "done" || run === null) return null;
		if (run.result === null) return t("playground.noReport");
		if (run.result.passed) return t("playground.passed");
		// O laço interrompido é a causa de verdade, e a mensagem dele fica no
		// fim do console (às vezes abaixo da dobra): sobe para o destaque.
		const loopMessage = t("playground.loopInterrupted");
		if (run.entries.some((entry) => entry.type === "error" && entry.message.includes(loopMessage))) {
			return `${t("playground.failed")} ${loopMessage}`;
		}
		return run.result.message ? `${t("playground.failed")} ${run.result.message}` : t("playground.failed");
	})();

	return (
		<>
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				onHelp={() => setTutorialVisible(!tutorialVisible)}
				onNext={() => evaluated && setModalVisible(true)}
			>
				<ActivityQuestion palette={palette} highlight={highlight} question={question} />
				<CodeSnippet code={filledCode} codeLanguage={codeLanguage} palette={palette} />

				<BlankBank
					palette={palette}
					chips={chips}
					slots={slots}
					onClear={clearSlot}
					// Com uma lacuna só, tocar noutro bloco troca a resposta, em vez de exigir desfazer antes.
					onPick={(index) => (blankCount === 1 ? changeSlots([index]) : placeChip(index))}
				/>

				<TouchableOpacity
					accessibilityRole="button"
					accessibilityState={{ disabled: !allFilled || status === "running" }}
					disabled={!allFilled || status === "running"}
					onPress={execute}
					style={[styles.runButton, { backgroundColor: palette.accent }, !allFilled ? styles.runDisabled : null]}
				>
					<Icon type="ionicon" name="play" color="#fff" size={16} />
					<Text style={styles.runText}>
						{status === "running" ? t("codeSection.running") : t("codeSection.run")}
					</Text>
					{status === "running" && <ActivityIndicator size="small" color="#fff" />}
				</TouchableOpacity>

				{/* Montada só enquanto roda — ou depois, se houver prévia a mostrar.
				    No timeout ela sai de cena: desmontar é o que mata a página
				    presa no laço infinito, que senão seguiria rodando em
				    segundo plano, gastando CPU e bateria. */}
				{(status === "running" || (status === "done" && showPreview)) && (
					<View
						style={[
							showPreview ? styles.preview : styles.hiddenWebView,
							{ borderColor: palette.border },
						]}
						pointerEvents={showPreview ? "auto" : "none"}
					>
						<SandboxWebView key={runKey} html={documentHtml} onMessage={handleMessage} />
					</View>
				)}

				{evaluated && (
					<View style={[styles.output, { backgroundColor: palette.terminalBg, borderColor: palette.border }]}>
						{resultText !== null && (
							<Text
								accessibilityLiveRegion="polite"
								style={[
								styles.resultText,
								{ color: passed ? palette.success : palette.warning },
								passed ? null : goldLabel(palette),
							]}
							>
								{resultText}
							</Text>
						)}
						{hiddenLines > 0 && (
							<Text style={[styles.mutedText, { color: palette.icon }]}>
								{t("playground.hiddenLines", { count: hiddenLines })}
							</Text>
						)}
						{allEntries.length === 0 && status === "done" ? (
							<Text style={[styles.mutedText, { color: palette.icon }]}>{t("codeSection.noOutput")}</Text>
						) : (
							shownEntries.map((entry, index) => (
								<Text
									key={index}
									style={[
										styles.line,
										{ color: entry.type === "error" ? palette.danger : palette.codeText },
									]}
								>
									{entry.type === "error" ? `${t("codeSection.consoleError")}: ${entry.message}` : entry.message}
								</Text>
							))
						)}
					</View>
				)}

				{evaluated ? null : (
					<ActivityHint palette={palette}>
						{t("playground.runFirst", { run: t("codeSection.run"), next: t("next") })}
					</ActivityHint>
				)}
			</LessonScreen>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={passed}
				onProceed={onProceed}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	// Mesmo botão "Executar" do terminal da teoria: pílula de acento, à esquerda.
	runButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "flex-start",
		gap: 8,
		minHeight: 40,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 20,
	},
	runDisabled: {
		opacity: 0.4,
	},
	runText: {
		color: "#fff",
		fontFamily: "Roboto",
		fontWeight: "600",
		fontSize: 14,
	},
	// Prévia visível: o HTML/CSS do aluno renderizado, rolável por dentro. Fundo
	// branco, como a aba "Web" do editor da teoria.
	preview: {
		height: 170,
		borderWidth: 2,
		borderRadius: 14,
		overflow: "hidden",
		backgroundColor: "#FFFFFF",
	},
	// JavaScript sem HTML: a WebView só executa. Nunca tamanho 0 nem
	// display:"none" (ver o mesmo estilo no `TerminalSection`).
	hiddenWebView: {
		position: "absolute",
		width: 1,
		height: 1,
		opacity: 0,
	},
	// Saída no mesmo painel escuro do terminal da teoria.
	output: {
		borderWidth: 2,
		borderRadius: 14,
		padding: 14,
		gap: 4,
	},
	resultText: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 15,
		marginBottom: 4,
	},
	line: {
		fontFamily: "monospace",
		fontSize: 13,
	},
	mutedText: {
		fontFamily: "monospace",
		fontSize: 13,
		fontStyle: "italic",
	},
});
