import {
	StyleProp,
	StyleSheet,
	TextStyle,
	TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import ResizableText from "../../../components/ResizableText";

interface Props {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	textStyle?: StyleProp<TextStyle>;
}

export default function SettingsButton({
	title,
	onPress,
	disabled = false,
	textStyle,
}: Props) {
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: colors.primary }]}
			onPress={onPress}
			disabled={disabled}
		>
			<ResizableText
				useCustomColor={textStyle !== undefined}
				style={[styles.text, textStyle]}
				defaultSize={20}
			>
				{title}
			</ResizableText>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		flexShrink: 1,
		alignItems: "center",
		justifyContent: "center",
		height: 50,
		width: "90%",
		margin: 15,
		marginBottom: 1,
		borderRadius: 10,
		elevation: 2,
	},
	text: {
		fontFamily: "Roboto",
	},
});
