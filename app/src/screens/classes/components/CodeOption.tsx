import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import { codapDark, codapLight } from "../../../components/codapCodeTheme";
import DarkMode from "../../../theme/DarkMode";
import type { TheoryPalette } from "./theory/theoryTheme";

/**
 * Tamanho-base do código das alternativas ("ache o erro"). Menor que o do
 * `CodeSnippet` (15) de propósito: aqui não há rolagem horizontal, então uma
 * linha de 30 caracteres precisa caber na largura do botão mesmo com a fonte
 * no máximo (o `FontSizeStore` soma de 0 a 5).
 */
const CODE_SIZE = 14;

/** Cores de código da teoria sem o fundo do editor: aqui quem pinta o fundo é o cartão da alternativa. */
const CARD_DARK = { ...codapDark, hljs: { ...codapDark.hljs, background: "transparent" } };
const CARD_LIGHT = { ...codapLight, hljs: { ...codapLight.hljs, background: "transparent" } };

interface Props {
	code: string;
	codeLanguage: string;
	/**
	 * Visual novo: o bloco fica sem moldura e usa as cores de código da paleta,
	 * porque quem desenha o cartão (e a seleção) é a alternativa. Sem ele, o
	 * visual antigo.
	 */
	palette?: TheoryPalette;
}

/**
 * Corpo de uma alternativa mostrada como código, com destaque de sintaxe.
 *
 * O `CustomSyntaxHighlighter` monta o código dentro de `ScrollView`s, que
 * poderiam roubar o toque do `TouchableOpacity` que envolve a alternativa. O
 * `pointerEvents="none"` tira tudo isso do alvo de toque: o botão inteiro
 * continua tocável, inclusive por cima do texto. Pelo mesmo motivo a rolagem
 * horizontal aqui é desligada — ela só existe para a linha não quebrar (quebrar
 * esconderia a segunda linha visual, porque o highlighter fixa a altura de
 * cada linha); a regra de 30 caracteres por linha é que garante o encaixe.
 */
export default function CodeOption({ code, codeLanguage, palette }: Props) {
	const theme = useTheme();
	const isDarkMode = theme === DarkMode;

	return (
		<View
			pointerEvents="none"
			style={palette ? styles.bare : [styles.box, isDarkMode ? styles.dark : styles.light]}
		>
			<ScrollView horizontal scrollEnabled={false} style={palette ? styles.noGrow : undefined}>
				<CustomSyntaxHighlighter
					language={codeLanguage}
					code={code.replace(/\s+$/, "")}
					defaultSize={CODE_SIZE}
					themeStyle={palette ? (palette.isDark ? CARD_DARK : CARD_LIGHT) : undefined}
					containerStyle={palette ? { flexGrow: 0 } : undefined}
				/>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	noGrow: {
		flexGrow: 0,
	},
	bare: {
		flex: 1,
	},
	box: {
		alignSelf: "stretch",
		borderWidth: 2,
		borderRadius: 12,
		overflow: "hidden",
	},
	// Mesmas cores do `CodeSnippet`/`CodeSection`.
	dark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
	},
	light: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
	},
});
