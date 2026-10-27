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
import ResizableText from "../../../components/ResizableText";
import ValidationModal from "./ValidationModal";
import CodeSnippet from "./CodeSnippet";
import Icon from "../../../components/Icon";
import useFontSizeStore from "../../../stores/FontSizeStore";
import useShopStore from "../../../stores/ShopStore";
import useUserStore from "../../../stores/UserStore";
import { refreshShop, spendHint } from "../../../services/ShopActions";
import { showAlert } from "../../../utils/showAlert";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";
import SandboxWebView, { parseSandboxMessage, type SandboxRunResult } from "./SandboxWebView";
import { ActivityHint, ActivityQuestion } from "./theory/ActivityParts";
import GradientBar from "./theory/GradientBar";
import LessonScreen, { useLessonLayout } from "./theory/LessonScreen";
import { FIXED_UI, TEXT_SIZE, goldLabel, useTheoryPalette, type TheoryPalette } from "./theory/theoryTheme";

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
	/** Título da lição (cabeçalho), posição na sessão e tamanho dela. */
	title?: string;
	step: number;
	total: number;
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
 *
 * Visual: a casca da teoria (`LessonScreen`) e, no lugar das abas HTML/CSS/JS,
 * um editor de duas abas — "Código" e "Resultado" — no mesmo cartão do editor da
 * teoria. Com o teclado aberto, a barra de símbolos substitui o botão
 * "Seguinte" (`footer` da casca) e a rolagem reserva o que o teclado cobre.
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
	title,
	step,
	total,
	progress,
	onProceed,
	onClose,
}: Props) {
	const palette = useTheoryPalette();
	const { textInset } = useLessonLayout();
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
	// Topo do teclado (coordenada de tela) enquanto ele está aberto; `null` fechado.
	const keyboardTop = useRef<number | null>(null);
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

	/**
	 * `screenY` vem em coordenadas de tela. `measure` (pageY) está na mesma
	 * referência; `measureInWindow` não — no emulador ele descontava a barra de
	 * status (41 dp) e a barra de símbolos ficava atrás do teclado. Repetida a cada
	 * mudança de tamanho da casca: com o teclado, a barra de navegação (escondida
	 * por padrão) reaparece e encolhe a janela depois do primeiro evento.
	 */
	const measureKeyboard = () => {
		const top = keyboardTop.current;
		if (top === null) return;
		containerRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
			setKeyboardOffset(Math.max(0, pageY + height - top));
		});
	};

	useEffect(() => {
		const shown = Keyboard.addListener("keyboardDidShow", (event) => {
			keyboardTop.current = event.endCoordinates.screenY;
			measureKeyboard();
			setKeyboardVisible(true);
			// Leva o editor para o topo da área visível: ele rola por dentro,
			// então o cursor fica sempre acima do teclado.
			if (inputRef.current?.isFocused()) {
				scrollRef.current?.scrollTo({ y: Math.max(0, editorY.current - 8), animated: true });
			}
		});
		const hidden = Keyboard.addListener("keyboardDidHide", () => {
			keyboardTop.current = null;
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

	// A barra de símbolos só aparece quando o teclado aberto é o do editor.
	const typing = keyboardVisible && tab === "code";
	const showResult = tab === "result";

	return (
		<>
			<LessonScreen
				palette={palette}
				title={title}
				progress={progress}
				step={step}
				total={total}
				onClose={onClose}
				tutorial="code_editor"
				onNext={() => evaluated && setModalVisible(true)}
				keyboardShouldPersistTaps="handled"
				rootRef={containerRef}
				onRootLayout={measureKeyboard}
				scrollRef={scrollRef}
				bottomInset={typing ? keyboardOffset + SYMBOL_BAR_HEIGHT : 0}
				footer={
					typing ? (
						<ScrollView
							horizontal
							keyboardShouldPersistTaps="always"
							showsHorizontalScrollIndicator={false}
							style={[
								styles.symbolBar,
								{ bottom: keyboardOffset, backgroundColor: palette.gradientTo, borderTopColor: palette.border },
							]}
							contentContainerStyle={styles.symbolBarContent}
						>
							<SymbolKey palette={palette} label="Tab" wide accessibilityLabel={t("editor.indent")} onPress={() => insert(INDENT)} />
							{SYMBOLS[codeLanguage].map((symbol) => (
								<SymbolKey
									key={symbol}
									palette={palette}
									label={symbol}
									accessibilityLabel={t("editor.insert", { symbol })}
									onPress={() => insert(symbol)}
								/>
							))}
						</ScrollView>
					) : undefined
				}
			>
				<View style={styles.intro}>
					<View
						style={[
							styles.badge,
							// No claro o selo é uma etiqueta dourada (ver `goldLabel`), com o recuo do texto como margem.
							palette.isDark
								? { paddingHorizontal: textInset }
								: { ...goldLabel(palette), marginHorizontal: textInset },
						]}
					>
						<Icon type="ionicon" name="trophy-outline" color={palette.gold} size={18} />
						<Text style={[styles.badgeText, { color: palette.goldInk }]}>{t("editor.badge")}</Text>
					</View>
					<ActivityQuestion palette={palette} highlight={highlight} question={question} />
				</View>

				<View
					style={[styles.card, { borderColor: palette.border, backgroundColor: palette.codeArea }]}
					onLayout={(event) => {
						editorY.current = event.nativeEvent.layout.y;
					}}
				>
					<View style={[styles.header, { borderBottomColor: palette.border }]}>
						<GradientBar from={palette.gradientFrom} to={palette.gradientTo} />
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
										style={[
											styles.tab,
											{ backgroundColor: selected ? palette.accent : palette.tabIdle },
											disabled ? styles.disabled : null,
										]}
									>
										<Text
											style={[
												styles.tabText,
												{ fontSize: FIXED_UI.tab, color: selected ? "#FFFFFF" : palette.text },
											]}
										>
											{value === "code" ? t("editor.codeTab") : t("editor.resultTab")}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					{tab === "code" ? (
						<TextInput
							ref={inputRef}
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
							placeholderTextColor={palette.icon}
							accessibilityLabel={t("editor.codeTab")}
							style={[styles.editor, { color: palette.codeText, fontSize: 15 + fontSize }]}
						/>
					) : null}

					{/* Fora das abas, na mesma posição da árvore: trocar de aba só
					    esconde a prévia, não remonta a página. Some no timeout —
					    desmontar é o que mata uma página presa. */}
					{webViewMounted && (
						<View
							style={showResult && showPreview ? styles.preview : styles.hiddenWebView}
							pointerEvents={showResult && showPreview ? "auto" : "none"}
						>
							<SandboxWebView key={runKey} html={documentHtml} onMessage={handleMessage} />
						</View>
					)}

					{showResult ? (
						<View style={[styles.output, { backgroundColor: palette.terminalBg, borderTopColor: palette.border }]}>
							{status === "running" && (
								<Text style={[styles.mutedText, { color: palette.icon }]}>{t("codeSection.running")}</Text>
							)}
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
							{stale && (
								<Text style={[styles.staleText, { color: palette.warning }, goldLabel(palette)]}>
									{t("editor.stale", { run: t("codeSection.run") })}
								</Text>
							)}
							{checks.length > 0 && (
								<View style={styles.checks}>
									<Text style={[styles.sectionLabel, { color: palette.icon }]}>{t("editor.requirements")}</Text>
									{checks.map((check, index) => (
										<View key={index} style={styles.checkRow}>
											<Icon
												type="ionicon"
												name={check.passed ? "checkmark-circle" : "close-circle"}
												color={check.passed ? palette.success : palette.danger}
												size={20}
											/>
											<Text
												style={[styles.checkText, { color: palette.codeText }]}
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
									<Text style={[styles.sectionLabel, { color: palette.icon }]}>{t("editor.console")}</Text>
									{hiddenLines > 0 && (
										<Text style={[styles.mutedText, { color: palette.icon }]}>
											{t("playground.hiddenLines", { count: hiddenLines })}
										</Text>
									)}
									{allEntries.length === 0 ? (
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
								</>
							)}
						</View>
					) : null}
				</View>

				{tab === "code" ? (
					<View style={styles.actions}>
						<TouchableOpacity accessibilityRole="button" onPress={reset} style={styles.secondaryButton}>
							<Icon type="ionicon" name="refresh" color={palette.icon} size={16} />
							<Text style={[styles.secondaryText, { color: palette.icon }]}>{t("editor.reset")}</Text>
						</TouchableOpacity>
						<RunButton
							palette={palette}
							status={status}
							onPress={execute}
							label={t("codeSection.run")}
							runningLabel={t("codeSection.running")}
						/>
					</View>
				) : null}

				<ChallengeHelp
					palette={palette}
					hints={hints}
					solution={solution}
					codeLanguage={codeLanguage}
					startedAt={startedAt}
					failedRuns={failedRuns}
				/>

				{evaluated ? null : (
					<ActivityHint palette={palette}>
						{t("editor.runFirst", { run: t("codeSection.run"), next: t("next") })}
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

function RunButton({
	palette,
	status,
	onPress,
	label,
	runningLabel,
}: {
	palette: TheoryPalette;
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
			style={[styles.runButton, { backgroundColor: palette.accent }]}
		>
			<Icon type="ionicon" name="play" color="#fff" size={16} />
			<Text style={styles.runText}>{running ? runningLabel : label}</Text>
			{running && <ActivityIndicator size="small" color="#fff" />}
		</TouchableOpacity>
	);
}

function SymbolKey({
	palette,
	label,
	accessibilityLabel,
	onPress,
	wide = false,
}: {
	palette: TheoryPalette;
	label: string;
	accessibilityLabel: string;
	onPress: () => void;
	/** Tecla com palavra (Tab), mais larga e com letra menor que a dos símbolos. */
	wide?: boolean;
}) {
	return (
		<TouchableOpacity
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			style={[styles.symbolKey, { backgroundColor: palette.tabIdle }, wide ? styles.symbolKeyWide : null]}
		>
			<Text style={[styles.symbolText, { color: palette.text }, wide ? styles.symbolTextWide : null]}>{label}</Text>
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
	palette,
	hints,
	solution,
	codeLanguage,
	startedAt,
	failedRuns,
}: {
	palette: TheoryPalette;
	hints: string[];
	solution: string;
	codeLanguage: Language;
	startedAt: number;
	failedRuns: number;
}) {
	const { t } = useTranslation();
	const [now, setNow] = useState(() => Date.now());
	const [revealed, setRevealed] = useState<number[]>([]);
	// Quantos passos a pessoa abriu com Dicas Instantâneas. É um piso, não uma
	// soma: o passo que o tempo (ou as tentativas) liberaria de qualquer jeito
	// não pode ser "gasto" duas vezes.
	const [forced, setForced] = useState(0);
	const [spending, setSpending] = useState(false);
	const totalSteps = hints.length + 1;
	const unlocked = Math.min(
		totalSteps,
		Math.max(
			Math.floor(failedRuns / RUNS_PER_STEP),
			Math.floor((now - startedAt) / MS_PER_STEP),
			forced
		)
	);
	// O estoque vem do servidor e é de uma conta; sem ele carregado, o botão não aparece.
	const remoteId = useUserStore((s) => s.user?.remoteId);
	const instantHints = useShopStore((s) => (s.userId === remoteId ? s.state?.instantHints ?? 0 : 0));
	const unlockedRef = useRef(unlocked);
	unlockedRef.current = unlocked;

	useEffect(() => {
		refreshShop();
	}, []);

	const releaseNow = async () => {
		if (spending) return;
		setSpending(true);
		const result = await spendHint();
		setSpending(false);
		if (result.ok) {
			// Lido do ref: durante o pedido o tempo pode ter aberto um passo.
			setForced((current) => Math.max(current, unlockedRef.current + 1));
			return;
		}
		showAlert(
			t("alert.market.title"),
			t(result.reason === "no_hints" ? "shop.noHints" : result.reason === "offline" ? "shop.errors.offline" : "shop.errors.generic")
		);
	};

	useEffect(() => {
		if (unlocked >= totalSteps) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [unlocked, totalSteps]);

	const nextStep = unlocked < totalSteps ? unlocked + 1 : null;
	const remainingRuns = nextStep === null ? 0 : nextStep * RUNS_PER_STEP - failedRuns;
	const remainingMs = nextStep === null ? 0 : nextStep * MS_PER_STEP - (now - startedAt);
	const card = { backgroundColor: palette.gradientTo, borderColor: palette.border };

	return (
		<View style={styles.help}>
			<ResizableText
				useCustomColor
				defaultSize={TEXT_SIZE.sectionTitle}
				style={[styles.helpTitle, { color: palette.text }]}
			>
				{t("editor.help")}
			</ResizableText>
			<ResizableText
				useCustomColor
				defaultSize={TEXT_SIZE.card + 1}
				style={[styles.helpIntro, { color: palette.icon }]}
			>
				{t("editor.helpIntro")}
			</ResizableText>
			{Array.from({ length: unlocked }, (_, index) => {
				const isSolution = index === hints.length;
				const open = revealed.includes(index);
				const title = isSolution ? t("editor.solution") : t("editor.hint", { n: index + 1 });
				return (
					<View key={index} style={[styles.helpCard, card]}>
						{open ? (
							<>
								<Text style={[styles.helpCardTitle, { color: palette.goldInk }]}>{title}</Text>
								{isSolution ? (
									<>
										<CodeSnippet code={solution} codeLanguage={codeLanguage} palette={palette} />
										<Text style={[styles.helpText, { color: palette.cardText }]}>{t("editor.solutionNote")}</Text>
									</>
								) : (
									<Text style={[styles.helpText, { color: palette.cardText }]}>{hints[index]}</Text>
								)}
							</>
						) : (
							<TouchableOpacity
								accessibilityRole="button"
								onPress={() => setRevealed((list) => [...list, index])}
								style={styles.revealButton}
							>
								<Icon type="ionicon" name={isSolution ? "key-outline" : "bulb-outline"} color={palette.gold} size={18} />
								<Text style={[styles.revealText, { color: palette.goldInk }]}>
									{isSolution ? t("editor.showSolution") : t("editor.showHint", { n: index + 1 })}
								</Text>
							</TouchableOpacity>
						)}
					</View>
				);
			})}
			{nextStep !== null && (
				<View style={[styles.helpCard, styles.lockedCard, { borderColor: palette.border }]}>
					<Icon type="ionicon" name="lock-closed-outline" color={palette.icon} size={16} />
					<Text style={[styles.lockedText, { color: palette.icon }]}>
						{t(nextStep === totalSteps ? "editor.solutionLocked" : "editor.hintLocked", {
							n: nextStep,
							time: formatTime(remainingMs),
							count: Math.max(1, remainingRuns),
						})}
					</Text>
				</View>
			)}
			{nextStep !== null && instantHints > 0 && (
				<View style={[styles.helpCard, card]}>
					<TouchableOpacity
						accessibilityRole="button"
						disabled={spending}
						onPress={releaseNow}
						style={[styles.revealButton, spending ? { opacity: 0.5 } : null]}
					>
						<Icon type="ionicon" name="flash-outline" color={palette.gold} size={18} />
						<Text style={[styles.revealText, { color: palette.goldInk }]}>{t("editor.useInstantHint", { count: instantHints })}</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	intro: {
		gap: 8,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	badgeText: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	// O editor é o mesmo cartão do `CodeSection` da teoria: borda da paleta, cantos
	// de 14 e um cabeçalho em degradê com as abas encostadas na linha da base.
	card: {
		width: "100%",
		borderWidth: 2,
		borderRadius: 14,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingLeft: 10,
		paddingRight: 12,
		paddingTop: 8,
		borderBottomWidth: 2,
	},
	tabs: {
		flexDirection: "row",
		alignItems: "flex-end",
	},
	tab: {
		minWidth: 96,
		height: 36,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 16,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	tabText: {
		fontFamily: "Roboto",
		fontWeight: "600",
	},
	disabled: {
		opacity: 0.4,
	},
	// Altura fixa, rolando por dentro: com o teclado aberto, a caixa inteira
	// cabe acima dele e o cursor nunca some.
	editor: {
		height: 240,
		padding: 14,
		fontFamily: "monospace",
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		minHeight: 44,
		paddingHorizontal: 8,
	},
	secondaryText: {
		fontFamily: "Roboto",
		fontWeight: "500",
		fontSize: 14,
	},
	// Mesma pílula de "Executar" do terminal da teoria.
	runButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		minHeight: 40,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 20,
	},
	runText: {
		color: "#fff",
		fontFamily: "Roboto",
		fontWeight: "600",
		fontSize: 14,
	},
	// Prévia: o HTML/CSS do aluno renderizado em fundo branco, como a aba "Web" da teoria.
	preview: {
		height: 200,
		backgroundColor: "#FFFFFF",
	},
	// Escondida sem desmontar: nunca tamanho 0 nem display:"none" (ver o mesmo
	// estilo no `TerminalSection`), senão a página pode não rodar.
	hiddenWebView: {
		position: "absolute",
		width: 1,
		height: 1,
		opacity: 0,
	},
	// Saída no painel escuro do terminal da teoria, colado à prévia.
	output: {
		borderTopWidth: 2,
		padding: 14,
		gap: 4,
	},
	resultText: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 15,
		marginBottom: 4,
	},
	staleText: {
		fontFamily: "Roboto",
		fontWeight: "500",
		fontSize: 14,
		marginBottom: 4,
	},
	sectionLabel: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 12,
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
		fontWeight: "500",
		fontSize: 14,
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
	help: {
		gap: 10,
	},
	helpTitle: {
		fontFamily: "Roboto",
		fontWeight: "700",
	},
	helpIntro: {
		fontFamily: "Roboto",
		fontWeight: "500",
	},
	helpCard: {
		borderRadius: 14,
		borderWidth: 2,
		padding: 14,
		gap: 8,
	},
	helpCardTitle: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 15,
	},
	helpText: {
		fontFamily: "Roboto",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 20,
	},
	revealButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		minHeight: 36,
	},
	revealText: {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 14,
	},
	lockedCard: {
		flexDirection: "row",
		alignItems: "center",
		borderStyle: "dashed",
	},
	lockedText: {
		flex: 1,
		fontFamily: "Roboto",
		fontWeight: "500",
		fontSize: 13,
	},
	symbolBar: {
		position: "absolute",
		left: 0,
		right: 0,
		maxHeight: SYMBOL_BAR_HEIGHT,
		borderTopWidth: 2,
	},
	symbolBarContent: {
		// flexGrow + justifyContent: com poucas teclas (HTML) o conjunto fica centralizado; com
		// muitas (JavaScript) o conteúdo passa da largura e a barra rola.
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	symbolKey: {
		minWidth: 40,
		height: 40,
		paddingHorizontal: 10,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	symbolKeyWide: {
		minWidth: 52,
	},
	symbolText: {
		fontFamily: "monospace",
		fontSize: 18,
		fontWeight: "700",
	},
	symbolTextWide: {
		fontSize: 14,
	},
});
