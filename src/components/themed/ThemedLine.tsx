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
}

export default function ThemedLine({ style = {} }: Props) {
	const { colors } = useTheme();

	return (
		<View style={[style, styles.line, { backgroundColor: colors.text }]} />
	);
}

const styles = StyleSheet.create({
	line: {
		marginTop: 1.5,
		height: 1.5,
		flexGrow: 1,
	},
});
