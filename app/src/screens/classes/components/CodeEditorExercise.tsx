import { useTheme } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	DimensionValue,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { WebViewMessageEvent } from "react-native-webview";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import Icon from "../../../components/Icon";
import DarkMode from "../../../theme/DarkMode";
import useFontSizeStore from "../../../stores/FontSizeStore";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";
import SandboxWebView, { parseSandboxMessage, type SandboxRunResult } from "./SandboxWebView";

/** Azul da marca: `colors.primary` deste app é quase a cor de fundo. */
const BRAND = "#5469D3";
/** Sem mensagem de volta nesse prazo, a execução é dada como travada. */
const WATCHDOG_MS = 4000;
/** Linhas de console mostradas (as últimas). */
const MAX_SHOWN_LINES = 40;
/**
 * Liberação da ajuda: cada passo (uma dica, e por fim a solução) abre a cada
 * tantas execuções que não passaram **ou** a cada tanto tempo — o que vier
 * primeiro. Só tempo puniria quem lê devagar e premiaria quem só espera; só
 * tentativas incentivaria apertar "Executar" sem pensar.
 */
const RUNS_PER_STEP = 2;
const MS_PER_STEP = 90_000;
/** Altura da barra de símbolos (as teclas têm 40 + respiro). */
const SYMBOL_BAR_HEIGHT = 52;
/** O "Tab" da barra de símbolos: o teclado do celular não tem um. */
const INDENT = "  ";

type Language = "HTML" | "CSS" | "JavaScript";
type RunStatus = "idle" | "running" | "done" | "timeout";
type Tab = "code" | "result";

/**
 * Símbolos que ficam escondidos nas camadas secundárias do teclado do celular,
 * por linguagem. Ficam numa barra fixa logo acima do teclado enquanto ele está
 * aberto.
 */
const SYMBOLS: Record<Language, string[]> = {
	HTML: ["<", ">", "/", "=", '"', "!", "-"],
	CSS: ["{", "}", ":", ";", ".", "#", "-", "%", '"', "(", ")"],
	JavaScript: ["(", ")", "{", "}", "[", "]", ";", "=", '"', "'", "`", ".", "+", "<", ">", "!", "&", "|", "$"],
};

/**
 * O iOS troca aspas retas por curvas ao digitar ("smart punctuation"), e aí o
 * código para de funcionar sem que o aluno entenda o motivo.
 */
function normalizeQuotes(code: string): string {
	return code.replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'");
}

function formatTime(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

interface Props {
	question: string;
	highlight: string[];
	codeLanguage: Language;
	starterCode: string;
	html?: string;
	css?: string;
	js?: string;
	checkScript: string;
	hints: string[];
	solution: string;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

/**
 * Desafio final de módulo (Fase 3b do roadmap, `code_editor`): o aluno digita o
 * código livremente e toca em "Executar" para rodá-lo de verdade na mesma
 * sandbox do `code_playground` (`SandboxWebView` + `buildSandboxHtmlDocument`
 * com CSP sem rede e proteção de laços). A correção é pelo comportamento: o
 * `checkScript` marca cada requisito com `__codap_check`, e o aluno vê a lista.
 *
 * O código executado fica congelado (`runCode`): editar depois não roda nada,
 * só marca o resultado como desatualizado — e só um resultado do código atual
 * conclui o desafio. Trocar de aba não remonta a WebView, então a página não
 * roda de novo nem conta uma tentativa a mais.
 */
export default function CodeEditorExercise({
	question,
	highlight = [""],
	codeLanguage,
	starterCode,
	html,
	css,
	js,
	checkScript,
	hints,
	solution,
	progress,
	onProceed,
	onClose,
}: Props) {
	const theme = useTheme();
	const isDarkMode = theme === DarkMode;
	const { t } = useTranslation();
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const [modalVisible, setModalVisible] = useState(false);

	const [code, setCode] = useState(starterCode);
	const [tab, setTab] = useState<Tab>("code");
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	// Quanto o teclado cobre da tela da atividade. Com o Android desenhando de
	// ponta a ponta (Expo SDK 57), o teclado se sobrepõe em vez de encolher a
	// janela; medir a sobreposição funciona nos dois casos.
	const [keyboardOffset, setKeyboardOffset] = useState(0);
	const containerRef = useRef<View>(null);
	const scrollRef = useRef<ScrollView>(null);
	const editorY = useRef(0);
	const inputRef = useRef<TextInput>(null);
	const selection = useRef({ start: starterCode.length, end: starterCode.length });

	const [status, setStatus] = useState<RunStatus>("idle");
	const [run, setRun] = useState<SandboxRunResult | null>(null);
	const [runKey, setRunKey] = useState(0);
	const [runCode, setRunCode] = useState("");
	const [failedRuns, setFailedRuns] = useState(0);
	const [startedAt] = useState(() => Date.now());
	// A mensagem de uma execução só conta uma vez (e nunca depois do timeout).
	const awaitingResult = useRef(false);
	const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearWatchdog = () => {
		if (watchdog.current !== null) clearTimeout(watchdog.current);
		watchdog.current = null;
	};
	useEffect(() => clearWatchdog, []);

	useEffect(() => {
		const shown = Keyboard.addListener("keyboardDidShow", (event) => {
			// `screenY` vem em coordenadas de tela. `measure` (pageY) está na
			// mesma referência; `measureInWindow` não — no emulador ele
			// descontava a barra de status (41 dp) e a barra de símbolos
			// ficava atrás do teclado.
			const keyboardTop = event.endCoordinates.screenY;
			containerRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
				setKeyboardOffset(Math.max(0, pageY + height - keyboardTop));
			});
			setKeyboardVisible(true);
			// Leva o editor para o topo da área visível: ele rola por dentro,
			// então o cursor fica sempre acima do teclado.
			if (inputRef.current?.isFocused()) {
				scrollRef.current?.scrollTo({ y: Math.max(0, editorY.current - 8), animated: true });
			}
		});
		const hidden = Keyboard.addListener("keyboardDidHide", () => {
			setKeyboardVisible(false);
			setKeyboardOffset(0);
		});
		return () => {
			shown.remove();
			hidden.remove();
		};
	}, []);

	const insert = (text: string) => {
		const { start, end } = selection.current;
		const next = code.slice(0, start) + text + code.slice(end);
		const caret = start + text.length;
		setCode(next);
		selection.current = { start: caret, end: caret };
		// Depois do re-render com o texto novo, devolve o cursor para logo
		// depois do símbolo inserido.
		requestAnimationFrame(() => inputRef.current?.setSelection(caret, caret));
	};

	const reset = () => {
		Alert.alert(t("editor.resetTitle"), t("editor.resetMessage"), [
			{ text: t("editor.cancel"), style: "cancel" },
			{
				text: t("editor.reset"),
				style: "destructive",
				onPress: () => {
					setCode(starterCode);
					selection.current = { start: starterCode.length, end: starterCode.length };
				},
			},
		]);
	};

	const execute = () => {
		const normalized = normalizeQuotes(code);
		if (normalized !== code) setCode(normalized);
		Keyboard.dismiss();
		clearWatchdog();
		awaitingResult.current = true;
		setRunCode(normalized);
		setRun(null);
		setStatus("running");
		setRunKey((key) => key + 1);
		setTab("result");
		watchdog.current = setTimeout(() => {
			awaitingResult.current = false;
			setStatus("timeout");
			setFailedRuns((count) => count + 1);
		}, WATCHDOG_MS);
	};

	const handleMessage = (event: WebViewMessageEvent) => {
		const received = parseSandboxMessage(event.nativeEvent.data);
		if (received === null || !awaitingResult.current) return;
		awaitingResult.current = false;
		clearWatchdog();
		setRun(received);
		setStatus("done");
		if (received.result?.passed !== true) setFailedRuns((count) => count + 1);
	};

	// Memorizado por execução: um `html` novo recarregaria a página e rodaria
	// o código de novo a cada re-render (o painel de ajuda re-renderiza a cada
	// segundo, a digitação a cada tecla).
	const documentHtml = useMemo(
		() =>
			buildSandboxHtmlDocument({
				html: codeLanguage === "HTML" ? runCode : html,
				css: codeLanguage === "CSS" ? runCode : css,
				js: codeLanguage === "JavaScript" ? runCode : js,
				checkScript,
				consolePanel: false,
				blockNetwork: true,
				loopGuardMs: 1000,
				loopGuardMessage: t("playground.loopInterrupted"),
				forwardConsole: false,
				errorLabel: t("codeSection.consoleError"),
			}),
		[runKey]
	);
	// JavaScript puro, sem HTML de apoio, não tem o que mostrar na prévia.
	const showPreview = codeLanguage !== "JavaScript" || Boolean(html);
	const webViewMounted = status === "running" || (status === "done" && showPreview);

	const stale = status !== "idle" && normalizeQuotes(code) !== runCode;
	const passed = status === "done" && run?.result?.passed === true && !stale;
	const evaluated = status === "done" || status === "timeout";
	const allEntries = run?.entries ?? [];
	const shownEntries = allEntries.slice(-MAX_SHOWN_LINES);
	const hiddenLines = allEntries.length - shownEntries.length;
	const checks = run?.result?.checks ?? [];

	const resultText = (() => {
		if (status === "timeout") return t("codeSection.timeout");
		if (status !== "done" || run === null) return null;
		if (run.result === null) return t("playground.noReport");
		// Passou, mas o código mudou depois: não pode parecer concluído.
		if (run.result.passed) return stale ? t("editor.passedBefore") : t("editor.passed");
		const loopMessage = t("playground.loopInterrupted");
		if (run.entries.some((entry) => entry.type === "error" && entry.message.includes(loopMessage))) {
			return `${t("playground.failed")} ${loopMessage}`;
		}
		return run.result.message ? `${t("playground.failed")} ${run.result.message}` : t("playground.failed");
	})();

	const editorColors = isDarkMode ? styles.editorDark : styles.editorLight;
	// A barra de símbolos só aparece quando o teclado aberto é o do editor.
	const typing = keyboardVisible && tab === "code";

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<View ref={containerRef} style={styles.fill} collapsable={false}>
					<Progressbar progress={progress} />
					<ScrollView
						ref={scrollRef}
						style={typing ? { marginBottom: keyboardOffset + SYMBOL_BAR_HEIGHT } : styles.scroller}
						keyboardShouldPersistTaps="handled"
					>
						<LessonHeader onClose={onClose} setTutorialVisible={() => undefined} />
						<View style={styles.badge}>
							<Icon type="ionicon" name="trophy-outline" color="#E0B04C" size={18} />
							<Text style={styles.badgeText}>{t("editor.badge")}</Text>
						</View>
						<ResizableHighlighter style={styles.question} highlight={highlight} text={question} defaultSize={21} />

						<View style={styles.tabs} accessibilityRole="tablist">
							{(["code", "result"] as Tab[]).map((value) => {
								const disabled = value === "result" && status === "idle";
								const selected = tab === value;
								return (
									<TouchableOpacity
										key={value}
										accessibilityRole="tab"
										accessibilityState={{ selected, disabled }}
										disabled={disabled}
										onPress={() => setTab(value)}
										style={[styles.tab, selected ? { backgroundColor: BRAND } : null, disabled ? styles.disabled : null]}
									>
										<Text style={styles.tabText}>{value === "code" ? t("editor.codeTab") : t("editor.resultTab")}</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						{tab === "code" ? (
							<>
								<TextInput
									ref={inputRef}
									onLayout={(event) => {
										editorY.current = event.nativeEvent.layout.y;
									}}
									value={code}
									onChangeText={setCode}
									onSelectionChange={(event) => {
										selection.current = event.nativeEvent.selection;
									}}
									multiline
									autoCorrect={false}
									autoCapitalize="none"
									autoComplete="off"
									spellCheck={false}
									importantForAutofill="no"
									smartInsertDelete={false}
									textAlignVertical="top"
									placeholder={t("editor.placeholder")}
									placeholderTextColor="#888888"
									accessibilityLabel={t("editor.codeTab")}
									style={[styles.editor, editorColors, { fontSize: 15 + fontSize }]}
								/>
								<View style={styles.actions}>
									<TouchableOpacity accessibilityRole="button" onPress={reset} style={styles.secondaryButton}>
										<Icon type="ionicon" name="refresh" color="#9AA9B8" size={16} />
										<Text style={styles.secondaryText}>{t("editor.reset")}</Text>
									</TouchableOpacity>
									<RunButton status={status} onPress={execute} label={t("codeSection.run")} runningLabel={t("codeSection.running")} />
								</View>
							</>
						) : null}

						{/* Fora das abas, na mesma posição da árvore: trocar de aba só
						    esconde a prévia, não remonta a página. Some no timeout —
						    desmontar é o que mata uma página presa. */}
						{webViewMounted && (
							<View
								style={[
									tab === "result" && showPreview ? styles.preview : styles.hiddenWebView,
									isDarkMode ? styles.boxDark : styles.boxLight,
								]}
								pointerEvents={tab === "result" && showPreview ? "auto" : "none"}
							>
								<SandboxWebView key={runKey} html={documentHtml} onMessage={handleMessage} />
							</View>
						)}

						{tab === "result" ? (
							<View style={[styles.output, isDarkMode ? styles.boxDark : styles.boxLight]}>
								{status === "running" && <Text style={styles.mutedText}>{t("codeSection.running")}</Text>}
								{resultText !== null && (
									<Text
										accessibilityLiveRegion="polite"
										style={[styles.resultText, { color: passed ? "#2e9e5b" : "#e0a552" }]}
									>
										{resultText}
									</Text>
								)}
								{stale && <Text style={styles.staleText}>{t("editor.stale", { run: t("codeSection.run") })}</Text>}
								{checks.length > 0 && (
									<View style={styles.checks}>
										<Text style={styles.sectionLabel}>{t("editor.requirements")}</Text>
										{checks.map((check, index) => (
											<View key={index} style={styles.checkRow}>
												<Icon
													type="ionicon"
													name={check.passed ? "checkmark-circle" : "close-circle"}
													color={check.passed ? "#2e9e5b" : "#e05252"}
													size={20}
												/>
												<Text
													style={[styles.checkText, { color: isDarkMode ? "#dddddd" : "#333333" }]}
													accessibilityLabel={`${check.passed ? "✓" : "✗"} ${check.label}`}
												>
													{check.label}
												</Text>
											</View>
										))}
									</View>
								)}
								{status === "done" && (
									<>
										<Text style={styles.sectionLabel}>{t("editor.console")}</Text>
										{hiddenLines > 0 && (
											<Text style={styles.mutedText}>{t("playground.hiddenLines", { count: hiddenLines })}</Text>
										)}
										{allEntries.length === 0 ? (
											<Text style={styles.mutedText}>{t("codeSection.noOutput")}</Text>
										) : (
											shownEntries.map((entry, index) => (
												<Text
													key={index}
													style={[
														styles.line,
														entry.type === "error"
															? styles.errorLine
															: { color: isDarkMode ? "#cccccc" : "#444444" },
													]}
												>
													{entry.type === "error" ? `${t("codeSection.consoleError")}: ${entry.message}` : entry.message}
												</Text>
											))
										)}
									</>
								)}
							</View>
						) : null}

						<ChallengeHelp
							hints={hints}
							solution={solution}
							codeLanguage={codeLanguage}
							startedAt={startedAt}
							failedRuns={failedRuns}
						/>

						<ResizableText style={styles.hint} defaultSize={14}>
							{evaluated ? "" : t("editor.runFirst", { run: t("codeSection.run"), next: t("next") })}
						</ResizableText>
					</ScrollView>

					{typing ? (
						<ScrollView
							horizontal
							keyboardShouldPersistTaps="always"
							showsHorizontalScrollIndicator={false}
							style={[styles.symbolBar, { bottom: keyboardOffset }, isDarkMode ? styles.boxDark : styles.boxLight]}
							contentContainerStyle={styles.symbolBarContent}
						>
							<SymbolKey label="⇥" accessibilityLabel={t("editor.indent")} onPress={() => insert(INDENT)} />
							{SYMBOLS[codeLanguage].map((symbol) => (
								<SymbolKey
									key={symbol}
									label={symbol}
									accessibilityLabel={t("editor.insert", { symbol })}
									onPress={() => insert(symbol)}
								/>
							))}
						</ScrollView>
					) : (
						<NextButton onPress={() => evaluated && setModalVisible(true)} />
					)}
				</View>
			</ThemedView>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={passed}
				onProceed={onProceed}
			/>
		</>
	);
}

function RunButton({
	status,
	onPress,
	label,
	runningLabel,
}: {
	status: RunStatus;
	onPress: () => void;
	label: string;
	runningLabel: string;
}) {
	const running = status === "running";
	return (
		<TouchableOpacity
			accessibilityRole="button"
			accessibilityState={{ disabled: running }}
			disabled={running}
			onPress={onPress}
			style={styles.runButton}
		>
			<Icon type="ionicon" name="play" color="#fff" size={16} />
			<Text style={styles.runText}>{running ? runningLabel : label}</Text>
			{running && <ActivityIndicator size="small" color="#fff" />}
		</TouchableOpacity>
	);
}

function SymbolKey({
	label,
	accessibilityLabel,
	onPress,
}: {
	label: string;
	accessibilityLabel: string;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			style={styles.symbolKey}
		>
			<Text style={styles.symbolText}>{label}</Text>
		</TouchableOpacity>
	);
}

/**
 * Ajuda progressiva: as dicas, e por fim a solução, abrem uma de cada vez (ver
 * `RUNS_PER_STEP`/`MS_PER_STEP`). Abrir não mostra o texto: o aluno ainda
 * escolhe tocar para ver. Tem o próprio relógio de 1 s, para o contador não
 * re-renderizar a tela inteira.
 */
function ChallengeHelp({
	hints,
	solution,
	codeLanguage,
	startedAt,
	failedRuns,
}: {
	hints: string[];
	solution: string;
	codeLanguage: Language;
	startedAt: number;
	failedRuns: number;
}) {
	const { t } = useTranslation();
	const [now, setNow] = useState(() => Date.now());
	const [revealed, setRevealed] = useState<number[]>([]);
	const totalSteps = hints.length + 1;
	const unlocked = Math.min(
		totalSteps,
		Math.max(Math.floor(failedRuns / RUNS_PER_STEP), Math.floor((now - startedAt) / MS_PER_STEP))
	);

	useEffect(() => {
		if (unlocked >= totalSteps) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [unlocked, totalSteps]);

	const nextStep = unlocked < totalSteps ? unlocked + 1 : null;
	const remainingRuns = nextStep === null ? 0 : nextStep * RUNS_PER_STEP - failedRuns;
	const remainingMs = nextStep === null ? 0 : nextStep * MS_PER_STEP - (now - startedAt);

	return (
		<View style={styles.help}>
			<ResizableText style={styles.helpTitle} defaultSize={17}>
				{t("editor.help")}
			</ResizableText>
			<ResizableText style={styles.hint} defaultSize={14}>
				{t("editor.helpIntro")}
			</ResizableText>
			{Array.from({ length: unlocked }, (_, index) => {
				const isSolution = index === hints.length;
				const open = revealed.includes(index);
				const title = isSolution ? t("editor.solution") : t("editor.hint", { n: index + 1 });
				return (
					<View key={index} style={styles.helpCard}>
						{open ? (
							<>
								<Text style={styles.helpCardTitle}>{title}</Text>
								{isSolution ? (
									<>
										<CodeSnippet code={solution} codeLanguage={codeLanguage} />
										<Text style={styles.helpText}>{t("editor.solutionNote")}</Text>
									</>
								) : (
									<Text style={styles.helpText}>{hints[index]}</Text>
								)}
							</>
						) : (
							<TouchableOpacity
								accessibilityRole="button"
								onPress={() => setRevealed((list) => [...list, index])}
								style={styles.revealButton}
							>
								<Icon type="ionicon" name={isSolution ? "key-outline" : "bulb-outline"} color="#E0B04C" size={18} />
								<Text style={styles.revealText}>
									{isSolution ? t("editor.showSolution") : t("editor.showHint", { n: index + 1 })}
								</Text>
							</TouchableOpacity>
						)}
					</View>
				);
			})}
			{nextStep !== null && (
				<View style={[styles.helpCard, styles.lockedCard]}>
					<Icon type="ionicon" name="lock-closed-outline" color="#7d8a97" size={16} />
					<Text style={styles.lockedText}>
						{t(nextStep === totalSteps ? "editor.solutionLocked" : "editor.hintLocked", {
							n: nextStep,
							time: formatTime(remainingMs),
							count: Math.max(1, remainingRuns),
						})}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
	},
	fill: {
		flex: 1,
	},
	scroller: {
		marginBottom: "25%",
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginHorizontal: 20,
		marginTop: 4,
	},
	badgeText: {
		color: "#E0B04C",
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	question: {
		marginHorizontal: 20,
		marginTop: 8,
		marginBottom: 16,
		fontFamily: "Roboto",
		color: "white",
		fontWeight: "bold",
	},
	tabs: {
		flexDirection: "row",
		gap: 8,
		marginHorizontal: 10,
		marginBottom: 8,
	},
	tab: {
		flex: 1,
		minHeight: 40,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: BRAND,
		alignItems: "center",
		justifyContent: "center",
	},
	tabText: {
		color: "#fff",
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 15,
	},
	disabled: {
		opacity: 0.4,
	},
	// Altura fixa, rolando por dentro: com o teclado aberto, a caixa inteira
	// cabe acima dele e o cursor nunca some.
	editor: {
		height: 240,
		marginHorizontal: 10,
		padding: 12,
		borderWidth: 1,
		borderRadius: 8,
		fontFamily: "monospace",
	},
	editorDark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
		color: "#e6e6e6",
	},
	editorLight: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
		color: "#222222",
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginHorizontal: 10,
		marginTop: 12,
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		minHeight: 44,
		paddingHorizontal: 8,
	},
	secondaryText: {
		color: "#9AA9B8",
		fontFamily: "Roboto",
		fontSize: 15,
	},
	runButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 10,
		paddingHorizontal: 22,
		borderRadius: 20,
		backgroundColor: BRAND,
		minHeight: 44,
	},
	runText: {
		color: "#fff",
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 16,
	},
	preview: {
		height: 200,
		marginHorizontal: 10,
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
	// Escondida sem desmontar: nunca tamanho 0 nem display:"none" (ver o mesmo
	// estilo no `TerminalSection`), senão a página pode não rodar.
	hiddenWebView: {
		position: "absolute",
		width: 1,
		height: 1,
		opacity: 0,
	},
	boxDark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
	},
	boxLight: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
	},
	output: {
		marginTop: 8,
		marginHorizontal: 10,
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		gap: 4,
	},
	resultText: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 15,
		marginBottom: 4,
	},
	staleText: {
		fontFamily: "Roboto",
		fontSize: 14,
		color: "#e0a552",
		marginBottom: 4,
	},
	sectionLabel: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 13,
		color: "#7d8a97",
		textTransform: "uppercase",
		marginTop: 6,
	},
	checks: {
		gap: 6,
		marginBottom: 4,
	},
	checkRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
	},
	checkText: {
		flex: 1,
		fontFamily: "Roboto",
		fontSize: 15,
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
	hint: {
		marginHorizontal: 12,
		marginVertical: 8,
		color: "#9AA9B8",
	},
	help: {
		marginTop: 20,
		marginHorizontal: 10,
		gap: 8,
	},
	helpTitle: {
		marginHorizontal: 2,
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	helpCard: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#3a4a5a",
		padding: 10,
		gap: 6,
	},
	helpCardTitle: {
		color: "#E0B04C",
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 15,
	},
	helpText: {
		color: "#c8d1da",
		fontFamily: "Roboto",
		fontSize: 15,
		lineHeight: 21,
	},
	revealButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		minHeight: 36,
	},
	revealText: {
		color: "#E0B04C",
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 15,
	},
	lockedCard: {
		flexDirection: "row",
		alignItems: "center",
		borderStyle: "dashed",
	},
	lockedText: {
		flex: 1,
		color: "#7d8a97",
		fontFamily: "Roboto",
		fontSize: 14,
	},
	symbolBar: {
		position: "absolute",
		left: 0,
		right: 0,
		maxHeight: SYMBOL_BAR_HEIGHT,
		borderTopWidth: 1,
	},
	symbolBarContent: {
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	symbolKey: {
		minWidth: 40,
		height: 40,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: "#33445a",
		alignItems: "center",
		justifyContent: "center",
	},
	symbolText: {
		color: "#ffffff",
		fontFamily: "monospace",
		fontSize: 18,
		fontWeight: "bold",
	},
});
