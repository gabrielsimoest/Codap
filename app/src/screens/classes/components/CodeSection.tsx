import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import WebView from "react-native-webview";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import Icon from "../../../components/Icon";
import { codapDark, codapLight } from "../../../components/codapCodeTheme";
import useFontSizeStore from "../../../stores/FontSizeStore";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";
import GradientBar from "./theory/GradientBar";
import { FIXED_UI, useTheoryPalette } from "./theory/theoryTheme";
import TerminalSection from "./TerminalSection";

interface CodeBlock {
	codeLanguage: "HTML" | "CSS" | "JavaScript" | "TypeScript";
	code: string;
}

// Rótulo da aba, não a linguagem em si — CustomSyntaxHighlighter continua
// recebendo `codeLanguage` sem abreviar. Existe porque "JavaScript"/"TypeScript"
// deixariam a aba larga demais para caber várias na mesma linha.
const TAB_LABELS: Partial<Record<CodeBlock["codeLanguage"], string>> = {
	JavaScript: "JS",
	TypeScript: "TS",
};

interface Props {
	onlyCode: boolean;
	codeLanguage: "HTML" | "CSS" | "JavaScript" | "TypeScript";
	code: string;
	/** Blocos extras no mesmo trecho (ex.: HTML + CSS juntos), cada um com sua própria aba. */
	additionalCode?: CodeBlock[];
	/** Opt-out do terminal — ver TheoryActivityContent.noTerminal em contracts.ts. */
	noTerminal?: boolean;
	/** JS pré-transpilado pra rodar no terminal quando codeLanguage é TypeScript — ver contracts.ts. */
	terminalCode?: string;
}

// A aba "Web" combina o primeiro bloco HTML + o primeiro CSS e, se houver um
// bloco JavaScript, executa ele de verdade (console.log e manipulação de DOM
// refletidos na própria página, via buildSandboxHtmlDocument). TypeScript
// nunca entra aqui — não há transpiler embarcado, então esses blocos
// continuam exigindo `onlyCode: true` no conteúdo da atividade.
function buildPreviewHtml(blocks: CodeBlock[], errorLabel: string): string {
	const html = blocks.find((block) => block.codeLanguage === "HTML")?.code;
	const css = blocks.find((block) => block.codeLanguage === "CSS")?.code;
	const js = blocks.find((block) => block.codeLanguage === "JavaScript")?.code;

	return buildSandboxHtmlDocument({ html, css, js, errorLabel });
}

/**
 * Altura **padrão e fixa** do card inteiro (abas + código + terminal), a mesma
 * em toda teoria, com ou sem terminal. A área de código (ou a prévia Web) ocupa
 * o que sobra: ~300 dp com o rodapé do terminal, que tem altura própria fixa
 * (ver `TerminalSection`). Código curto deixa espaço sobrando, longo rola por
 * dentro.
 */
const CARD_HEIGHT = 360;
const CODE_PADDING = 14;

/**
 * Editor integrado da teoria: um único card com cabeçalho (abas + "Copiar"),
 * área de código com números de linha e, quando elegível, o terminal no rodapé
 * — tudo na mesma borda, como um editor de verdade.
 *
 * As abas continuam sendo uma por bloco de código (`code` + `additionalCode`,
 * sem limite) mais a "Web" quando `onlyCode` é falso. O tamanho do código
 * acompanha a fonte do app (`CustomSyntaxHighlighter`); abas, "Copiar" e o
 * gutter de números de linha usam tamanho fixo ou o mesmo do código.
 */
export default function CodeSection({
	onlyCode,
	codeLanguage,
	code,
	additionalCode,
	noTerminal,
	terminalCode,
}: Props) {
	const palette = useTheoryPalette();
	const { t } = useTranslation();
	const fontSize = useFontSizeStore((s) => s.fontSize);

	const blocks: CodeBlock[] = [{ codeLanguage, code }, ...(additionalCode ?? [])];

	// Terminal (botão "Executar" + saída): só pra código que não manipula DOM —
	// testar "não tem bloco HTML" (em vez de reaproveitar `onlyCode`, que
	// controla só a aba "Web") mantém as duas condições independentes.
	// `terminalCode`, quando presente, sempre tem prioridade como fonte de
	// execução — cobre tanto TypeScript (JS pré-transpilado, já que não há
	// transpiler embarcado) quanto JavaScript cujo código exibido não é
	// diretamente executável (`export` fora de módulo, uma chamada de rede
	// simulada) sem mudar o que é ensinado na tela. Sem `terminalCode`, um bloco
	// JavaScript puro usa `code`/`additionalCode` diretamente, a não ser que
	// `noTerminal` (opt-out pra código que mecanicamente rodaria mas não produz
	// saída de console) esteja marcado.
	const hasHtmlBlock = blocks.some((block) => block.codeLanguage === "HTML");
	const hasTerminalCode = terminalCode !== undefined;
	const isPlainJsEligible =
		!hasHtmlBlock && codeLanguage === "JavaScript" && !noTerminal && !hasTerminalCode;
	const terminalEligible = !hasHtmlBlock && (hasTerminalCode || isPlainJsEligible);
	const terminalSource = hasTerminalCode
		? (terminalCode as string)
		: blocks
				.filter((block) => block.codeLanguage === "JavaScript")
				.map((block) => block.code)
				.join("\n\n");

	const tabs = [
		...blocks.map((block, index) => ({
			id: `code-${index}`,
			label: TAB_LABELS[block.codeLanguage] ?? block.codeLanguage,
		})),
		...(onlyCode ? [] : [{ id: "web", label: "Web" }]),
	];

	const [activeTabId, setActiveTabId] = useState(tabs[0].id);
	// A quantidade de abas varia por atividade (1 a N), mas o CodeSection não
	// remonta ao trocar de atividade dentro da mesma lição (mesma posição na
	// árvore) — sem este fallback, uma aba salva de uma atividade anterior
	// (ex.: "code-1") poderia não existir na atividade atual e não renderizar nada.
	const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
	const activeBlockIndex = activeTab.id.startsWith("code-")
		? Number(activeTab.id.slice("code-".length))
		: -1;
	const activeBlock = activeBlockIndex >= 0 ? blocks[activeBlockIndex] : null;

	// Copiar: só o código da aba ativa. A aba "Web" não tem o que copiar.
	const [copied, setCopied] = useState(false);
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (copiedTimer.current !== null) clearTimeout(copiedTimer.current);
		},
		[]
	);
	const copy = async () => {
		if (!activeBlock) return;
		await Clipboard.setStringAsync(activeBlock.code);
		setCopied(true);
		if (copiedTimer.current !== null) clearTimeout(copiedTimer.current);
		copiedTimer.current = setTimeout(() => setCopied(false), 1800);
	};

	const lineCount = activeBlock ? activeBlock.code.split("\n").length : 0;
	const codeFontSize = 15 + fontSize;
	// Cada linha do `NativeSyntaxHighlighter` é uma caixa de altura fixa
	// `fontSize + 5` (ver `createNativeElement`), então a altura da linha é
	// conhecida sem medir. O gutter usa a **mesma** caixa por número, em vez de
	// um `Text` multilinha com `lineHeight`: no Android o `lineHeight` é escalado
	// pelo tamanho de fonte do sistema e a altura (`height`) não, então com a
	// fonte do sistema acima de 1,0 os números iam se afastando do código linha
	// a linha. Código e gutter ignoram essa escala (`allowFontScaling={false}`):
	// o app tem o próprio controle de tamanho, e a caixa da linha é fixa.
	const lineHeight = codeFontSize + 5;

	return (
		<View
			style={[
				styles.card,
				{ height: CARD_HEIGHT, borderColor: palette.border, backgroundColor: palette.codeArea },
			]}
		>
			<View style={[styles.header, { borderBottomColor: palette.border }]}>
				<GradientBar from={palette.gradientFrom} to={palette.gradientTo} />
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.tabsScroll}
					contentContainerStyle={styles.tabs}
				>
					{tabs.map((tab) => {
						const selected = activeTab.id === tab.id;
						return (
							<Pressable
								key={tab.id}
								accessibilityRole="tab"
								accessibilityState={{ selected }}
								onPress={() => setActiveTabId(tab.id)}
								style={[styles.tab, { backgroundColor: selected ? palette.accent : palette.tabIdle }]}
							>
								<Text
									style={[
										styles.tabText,
										{ fontSize: FIXED_UI.tab, color: selected ? "#FFFFFF" : palette.text },
									]}
								>
									{tab.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
				{activeBlock ? (
					<Pressable
						onPress={copy}
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel={t("codeSection.copy")}
						style={styles.copy}
					>
						<Icon
							type="ionicon"
							name={copied ? "checkmark" : "copy-outline"}
							color={palette.icon}
							size={18}
						/>
						<Text style={[styles.copyText, { color: palette.icon, fontSize: FIXED_UI.copy }]}>
							{copied ? t("codeSection.copied") : t("codeSection.copy")}
						</Text>
					</Pressable>
				) : null}
			</View>

			{activeBlock ? (
				<View style={{ flex: 1, backgroundColor: palette.codeArea }}>
					<ScrollView
						nestedScrollEnabled
						contentContainerStyle={{ padding: CODE_PADDING, flexGrow: 1 }}
					>
						<View style={styles.codeRow}>
							<View style={styles.gutter}>
								{Array.from({ length: lineCount }, (_, index) => (
									<Text
										key={index}
										allowFontScaling={false}
										// Mesma fonte e mesma caixa do código, para as linhas coincidirem.
										style={[
											styles.gutterLine,
											{ color: palette.icon, fontSize: codeFontSize, height: lineHeight },
										]}
									>
										{index + 1}
									</Text>
								))}
							</View>
							<View style={styles.codeColumn}>
								<CustomSyntaxHighlighter
									language={activeBlock.codeLanguage}
									code={activeBlock.code}
									themeStyle={palette.isDark ? codapDark : codapLight}
									// O scroll horizontal preenche a altura da caixa: sem isso ele tem a
									// altura do código e a barra de rolagem aparece logo abaixo da
									// última linha, longe do limite da seção.
									containerStyle={{ flexGrow: 1 }}
								/>
							</View>
						</View>
					</ScrollView>
				</View>
			) : (
				<View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
					<WebView
						source={{ html: buildPreviewHtml(blocks, t("codeSection.consoleError")) }}
						javaScriptEnabled={true}
						containerStyle={{ flex: 1 }}
						textZoom={220}
						nestedScrollEnabled={true}
					/>
				</View>
			)}

			{terminalEligible && (
				<TerminalSection code={terminalSource} isDarkMode={palette.isDark} palette={palette} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: "100%",
		borderWidth: 2,
		borderRadius: 14,
		overflow: "hidden",
	},
	// As abas encostam na base do cabeçalho (como no Figma): sem padding
	// embaixo, alinhadas ao fundo, e a linha da base separa o editor do código.
	header: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingLeft: 10,
		paddingRight: 12,
		paddingTop: 8,
		borderBottomWidth: 2,
	},
	tabsScroll: {
		flexGrow: 0,
		flexShrink: 1,
	},
	tabs: {
		alignItems: "flex-end",
	},
	// Cantos arredondados só em cima e sem espaço entre as abas.
	tab: {
		minWidth: 72,
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
	copy: {
		marginLeft: "auto",
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingLeft: 12,
		paddingBottom: 11,
	},
	copyText: {
		fontFamily: "Roboto",
		fontWeight: "500",
	},
	codeRow: {
		flexDirection: "row",
		flexGrow: 1,
	},
	gutter: {
		opacity: 0.5,
		marginRight: 14,
	},
	gutterLine: {
		fontFamily: "monospace",
		textAlign: "right",
	},
	codeColumn: {
		flex: 1,
	},
});
