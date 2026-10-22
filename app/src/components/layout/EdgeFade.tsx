import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";

/** Altura do trecho que esmaece sob o cabeçalho das abas. */
export const HEADER_FADE = 28;
/** Quanto o degradê de baixo começa acima do topo da barra de abas. */
export const TAB_BAR_FADE = 36;

interface Props {
	edge: "top" | "bottom";
	height: number;
	/**
	 * Só no degradê de baixo: quantos dp, a partir do topo dele, esmaecem — o resto é
	 * a cor da tela sólida (a faixa da barra de abas). Padrão: o degradê todo esmaece.
	 */
	fade?: number;
}

/**
 * Degradê da cor da tela que faz o conteúdo da rolagem surgir e sumir em vez de
 * ser cortado por uma linha: sob o cabeçalho e atrás da barra de abas. Fica
 * por cima da rolagem e não pega toque.
 *
 * Usa a cor da tela com alfa 00 no fim, e não "transparent": no Android o
 * degradê interpola por preto.
 */
export default function EdgeFade({ edge, height, fade }: Props) {
	const { colors } = useTheme();
	const screen = colors.background;
	const fadeStop = fade === undefined ? 1 : Math.min(fade / height, 1);

	return (
		<LinearGradient
			pointerEvents="none"
			colors={edge === "top" ? [screen, `${screen}00`] : [`${screen}00`, screen, screen]}
			locations={edge === "top" ? undefined : [0, fadeStop, 1]}
			style={[styles.fade, edge === "top" ? styles.top : styles.bottom, { height }]}
		/>
	);
}

const styles = StyleSheet.create({
	fade: {
		position: "absolute",
		left: 0,
		right: 0,
	},
	top: {
		top: 0,
	},
	bottom: {
		bottom: 0,
	},
});
