import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
	from: string;
	to: string;
}

/**
 * Fundo com gradiente linear da esquerda para a direita: `from` em 0% e `to` a
 * partir de 38%. Ocupa o pai inteiro (`absoluteFill`) e não recebe toque.
 */
export default function GradientBar({ from, to }: Props) {
	return (
		<LinearGradient
			colors={[from, to]}
			locations={[0, 0.38]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 0 }}
			style={StyleSheet.absoluteFill}
			pointerEvents="none"
		/>
	);
}
