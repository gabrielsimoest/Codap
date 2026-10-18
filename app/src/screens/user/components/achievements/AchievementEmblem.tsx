import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import useThemeStore from "../../../../stores/ThemeStore";
import LightMode from "../../../../theme/LightMode";

interface Props {
	source: ImageSourcePropType;
	size: number;
	unlocked: boolean;
}

// Cores do "encaixe vazio" por tema: o preenchimento é mais escuro que o fundo
// do cartão, a borda de cima é a sombra que cai para dentro do buraco e a de
// baixo é a luz batendo na beirada — o efeito de baixo-relevo.
const HOLE_COLORS = {
	dark: { fill: "#0a1118", shadow: "#020507", rim: "#2a3f54" },
	light: { fill: "#d9dde3", shadow: "#9aa3ae", rim: "#ffffff" },
};

/**
 * Emblema de uma conquista. Obtida, é a própria imagem; não obtida, é a
 * silhueta dela afundada no cartão, como um encaixe esperando a peça.
 *
 * A silhueta sai da própria imagem via `tintColor` (pinta todo pixel não
 * transparente de uma cor só, preservando o alfa), em três camadas
 * deslocadas — sem precisar de um segundo arquivo de imagem por emblema.
 */
export default function AchievementEmblem({ source, size, unlocked }: Props) {
	const theme = useThemeStore((s) => s.theme);
	const box = { width: size, height: size };

	if (unlocked) {
		return <Image source={source} style={box} resizeMode="contain" />;
	}

	const colors = theme === LightMode ? HOLE_COLORS.light : HOLE_COLORS.dark;
	const offset = Math.max(1, Math.round(size * 0.012));

	return (
		<View style={box}>
			<Image
				source={source}
				resizeMode="contain"
				style={[
					styles.layer,
					{ tintColor: colors.rim, transform: [{ translateY: offset }] },
				]}
			/>
			<Image
				source={source}
				resizeMode="contain"
				style={[
					styles.layer,
					{ tintColor: colors.shadow, transform: [{ translateY: -offset }] },
				]}
			/>
			<Image
				source={source}
				resizeMode="contain"
				style={[styles.layer, { tintColor: colors.fill }]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	layer: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
	},
});
