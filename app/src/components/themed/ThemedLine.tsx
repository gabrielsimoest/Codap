import { useTheme } from "@react-navigation/native";
import { useAppColors } from "../../theme/appColors";
import {
	DimensionValue,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from "react-native";

interface Props {
	style?: StyleProp<ViewStyle>;
	theme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
	height?: number;
}

export default function ThemedLine({
	style = {},
	theme = "text",
	height = 1,
}: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	// A regra padrão (`text`) é a cor do texto: no escuro um fio claro, no claro um
	// fio de tinta, duro demais para um separador — lá ela vira `app.rule`.
	const color = theme === "text" && !app.isDark ? app.rule : colors[theme];

	return (
		<View
			style={[
				style,
				styles.line,
				{ backgroundColor: color, height: height },
			]}
		/>
	);
}

const styles = StyleSheet.create({
	line: {
		flexGrow: 1,
	},
});
