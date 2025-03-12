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
}

export default function ThemedLine({ style = {}, theme = "text" }: Props) {
	const { colors } = useTheme();

	return (
		<View
			style={[style, styles.line, { backgroundColor: colors[theme] }]}
		/>
	);
}

const styles = StyleSheet.create({
	line: {
		marginTop: 1,
		height: 1,
		flexGrow: 1,
	},
});
