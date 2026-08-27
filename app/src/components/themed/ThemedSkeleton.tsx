import { useTheme } from "@react-navigation/native";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";
import { View, CustomAnimation } from "react-native-animatable";

const pulse: CustomAnimation = {
	0: { opacity: 0.4 },
	0.5: { opacity: 0.85 },
	1: { opacity: 0.4 },
};

interface Props {
	theme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
	width?: DimensionValue;
	height: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
}

/** Placeholder retangular com "respiração" de opacidade, usado enquanto uma query ainda não tem dados (`isPending`). */
export default function ThemedSkeleton({
	theme = "primary",
	width = "100%",
	height,
	borderRadius = 8,
	style,
}: Props) {
	const { colors } = useTheme();

	return (
		<View
			animation={pulse}
			iterationCount="infinite"
			duration={1100}
			easing="ease-in-out"
			style={[
				{ width, height, borderRadius, backgroundColor: colors[theme] },
				style,
			]}
		/>
	);
}
