import {
	LayoutChangeEvent,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import ThemedText from "../../../components/themed/ThemedText";
import RowView from "../../../components/layout/RowView";
import DarkMode from "../../../theme/DarkMode";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WebView from "react-native-webview";
import { buildSandboxHtmlDocument } from "../../../utils/codeSandboxDocument";

interface CodeBlock {
	codeLanguage: "HTML" | "CSS" | "JavaScript" | "TypeScript";
	code: string;
}

interface Props {
	onlyCode: boolean;
	codeLanguage: "HTML" | "CSS" | "JavaScript" | "TypeScript";
	code: string;
	/** Blocos extras no mesmo trecho (ex.: HTML + CSS juntos), cada um com sua própria aba. */
	additionalCode?: CodeBlock[];
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

export default function CodeSection({
	onlyCode,
	codeLanguage,
	code,
	additionalCode,
}: Props) {
	const theme = useTheme();
	const isDarkMode = theme === DarkMode;
	const { t } = useTranslation();

	const blocks: CodeBlock[] = [
		{ codeLanguage, code },
		...(additionalCode ?? []),
	];

	const tabs = [
		...blocks.map((block, index) => ({
			id: `code-${index}`,
			label: block.codeLanguage as string,
		})),
		...(onlyCode ? [] : [{ id: "web", label: "Web" }]),
	];

	const [activeTabId, setActiveTabId] = useState(tabs[0].id);
	// A quantidade de abas varia por atividade (1 a 4), mas o CodeSection não
	// remonta ao trocar de atividade dentro da mesma lição (mesma posição na
	// árvore) — sem este fallback, uma aba salva de uma atividade anterior
	// (ex.: "code-1") poderia não existir na atividade atual e não renderizar nada.
	const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

	const [highlighterHeight, setHighlighterHeight] = useState(100);
	const onHighlighterLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setHighlighterHeight(height);
	};

	const activeBlockIndex = activeTab.id.startsWith("code-")
		? Number(activeTab.id.slice("code-".length))
		: -1;

	const content =
		activeBlockIndex >= 0 ? (
			<ScrollView style={{ width: "100%" }} onLayout={onHighlighterLayout}>
				<CustomSyntaxHighlighter
					language={blocks[activeBlockIndex].codeLanguage}
					code={blocks[activeBlockIndex].code}
				/>
			</ScrollView>
		) : (
			<View style={{ width: "100%", height: highlighterHeight }}>
				<WebView
					source={{ html: buildPreviewHtml(blocks, t("codeSection.consoleError")) }}
					javaScriptEnabled={true}
					containerStyle={{
						flex: 0,
						height: highlighterHeight,
					}}
					textZoom={220}
					nestedScrollEnabled={true}
				/>
			</View>
		);

	if (tabs.length === 1)
		return (
			<View
				style={[
					isDarkMode ? styles.codeArea : styles.codeAreaLight,
					{ width: "100%", marginVertical: 20 },
				]}
			>
				{content}
			</View>
		);

	return (
		<View>
			<RowView style={{ marginTop: 10 }}>
				{tabs.map((tab, index) => (
					<Pressable
						key={tab.id}
						style={[
							styles.button,
							styles[isDarkMode ? "buttonDark" : "buttonLight"],
							activeTab.id === tab.id
								? styles[
										theme === DarkMode
											? "selectedDark"
											: "selectedLight"
								  ]
								: null,
							index > 0 ? { marginLeft: -15 } : null,
						]}
						onPress={() => setActiveTabId(tab.id)}
					>
						<ThemedText style={styles.textButton}>
							{tab.label}
						</ThemedText>
					</Pressable>
				))}
			</RowView>
			<View style={isDarkMode ? styles.codeArea : styles.codeAreaLight}>
				{content}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	textButton: {
		paddingHorizontal: 5,
		fontSize: 18,
		fontFamily: "Roboto",
	},

	button: {
		alignItems: "center",
		justifyContent: "center",
		width: "25%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 1,
	},

	buttonDark: {
		backgroundColor: "#1B2B39",
	},

	buttonLight: {
		backgroundColor: "#757575",
	},

	selectedDark: {
		backgroundColor: "#304D66",
		zIndex: 99,
	},

	selectedLight: {
		backgroundColor: "#A5A5A5",
		zIndex: 99,
	},

	//Code area dark

	codeArea: {
		height: 300,
		// Mesmo valor de "background" do tema atomOneDark (hljs) usado no
		// syntax highlighter — sem isso, o espaço da caixa que sobra abaixo
		// do código mostra a cor de fundo do card por trás, criando uma
		// emenda visível de cor diferente.
		backgroundColor: "#282c34",
		borderWidth: 5,
		borderColor: "#304D66",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 8,
		marginBottom: "3%",
	},

	//Code area light

	codeAreaLight: {
		height: 300,
		// Mesmo valor de "background" do tema atomOneLight (hljs) — ver
		// comentário equivalente em codeArea.
		backgroundColor: "#fafafa",
		borderWidth: 5,
		borderColor: "#A5A5A5",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 8,
		marginBottom: "3%",
	},
});
