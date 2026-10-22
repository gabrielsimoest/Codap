import { StyleSheet, View } from "react-native";
import Icon from "./Icon";
import ResizableText from "./ResizableText";
import { useTheoryPalette } from "../screens/classes/components/theory/theoryTheme";

interface Props {
	kind: "success" | "error";
	children: string;
}

/**
 * Resultado de uma ação dentro de um modal ("link enviado", "sem conexão"): ícone
 * e texto na cor do estado. O ícone repete o que a cor diz, para não depender
 * dela, e a região é anunciada pelo leitor de tela quando aparece.
 */
export default function StatusLine({ kind, children }: Props) {
	const palette = useTheoryPalette();
	const color = kind === "success" ? palette.success : palette.danger;

	return (
		<View style={styles.row} accessibilityLiveRegion="polite">
			<Icon
				type="ionicon"
				name={kind === "success" ? "checkmark-circle" : "alert-circle"}
				size={20}
				color={color}
				style={styles.icon}
			/>
			<View style={styles.message}>
				<ResizableText useCustomColor style={[styles.text, { color }]} defaultSize={15}>
					{children}
				</ResizableText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
	},
	// Alinha o ícone com a primeira linha do texto.
	icon: {
		marginTop: 1,
	},
	message: {
		flex: 1,
	},
	text: {
		fontFamily: "Roboto",
	},
});
