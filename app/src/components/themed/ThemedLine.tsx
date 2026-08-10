import { useTheme } from "@react-navigation/native";
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

	return (
		<View
			style={[
				style,
				styles.line,
				{ backgroundColor: colors[theme], height: height },
			]}
		/>
	);
}

const styles = StyleSheet.create({
	line: {
		flexGrow: 1,
	},
});
