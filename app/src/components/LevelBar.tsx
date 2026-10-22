import { Animated, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface Props {
	/** Fração preenchida, de 0 a 1 — um número fixo ou um `Animated.Value` (a tela de conclusão anima). */
	fill: number | Animated.Value;
	style?: StyleProp<ViewStyle>;
}

/** Barra de progresso do nível. Usa o azul da marca (`#5469D3`), que se lê nos dois temas. */
export default function LevelBar({ fill, style }: Props) {
	const width =
		typeof fill === "number"
			? (`${Math.round(Math.min(Math.max(fill, 0), 1) * 100)}%` as const)
			: fill.interpolate({
					inputRange: [0, 1],
					outputRange: ["0%", "100%"],
					extrapolate: "clamp",
			  });

	return (
		<View style={[styles.track, style]}>
			<Animated.View style={[styles.fill, { width }]} />
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		height: 14,
		borderRadius: 7,
		overflow: "hidden",
		backgroundColor: "rgba(127, 127, 127, 0.28)",
	},
	fill: {
		height: "100%",
		borderRadius: 7,
		backgroundColor: "#5469D3",
	},
});
