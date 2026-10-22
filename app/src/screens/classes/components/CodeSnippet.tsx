import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import { codapDark, codapLight } from "../../../components/codapCodeTheme";
import DarkMode from "../../../theme/DarkMode";
import type { TheoryPalette } from "./theory/theoryTheme";

interface Props {
	code: string;
	codeLanguage: string;
	/**
	 * Visual novo (o mesmo editor da teoria: fundo, borda e cores de código da
	 * paleta). Sem ele, o visual antigo — que os exercícios ainda não migrados
	 * continuam usando.
	 */
	palette?: TheoryPalette;
}

/**
 * Trecho de código só de leitura, usado no enunciado de exercícios.
 *
 * Não é o `CodeSection` de propósito: aquele tem altura fixa, aba "Web" e o
 * botão "Executar" do terminal — num "qual a saída?", rodar o código entregaria
 * a resposta. Aqui a caixa acompanha a altura do trecho, e linhas longas rolam
 * na horizontal em vez de quebrar (quebrar linha muda a leitura do código).
 */
export default function CodeSnippet({ code, codeLanguage, palette }: Props) {
	const theme = useTheme();
	const isDarkMode = theme === DarkMode;

	if (palette) {
		return (
			<View
				style={[
					styles.themedBox,
					{ backgroundColor: palette.codeArea, borderColor: palette.border },
				]}
			>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<CustomSyntaxHighlighter
						language={codeLanguage}
						code={code}
						themeStyle={palette.isDark ? codapDark : codapLight}
					/>
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={[styles.box, isDarkMode ? styles.dark : styles.light]}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<CustomSyntaxHighlighter language={codeLanguage} code={code} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	themedBox: {
		borderWidth: 2,
		borderRadius: 14,
		padding: 14,
		overflow: "hidden",
	},
	box: {
		marginHorizontal: 10,
		marginBottom: 10,
		borderWidth: 3,
		borderRadius: 12,
		overflow: "hidden",
	},
	// Mesmas cores do `CodeSection` (fundo = "background" do tema hljs), para o
	// trecho parecer o mesmo bloco de código que o aluno viu na teoria.
	dark: {
		backgroundColor: "#282c34",
		borderColor: "#304D66",
	},
	light: {
		backgroundColor: "#fafafa",
		borderColor: "#A5A5A5",
	},
});
