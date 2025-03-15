import {
	StyleProp,
	StyleSheet,
	TextStyle,
	TouchableOpacity,
} from "react-native";
import ResizableText from "../../../components/ResizableText";

interface Props {
	title: string;
	onPress: () => void;
	textStyle?: StyleProp<TextStyle>;
	reversed?: boolean;
}

export default function MarketButton({
	title,
	onPress,
	textStyle,
	reversed = false,
}: Props) {
	return (
		<TouchableOpacity
			style={[
				styles.button,
				reversed
					? { alignSelf: "flex-start" }
					: { alignSelf: "flex-end" },
			]}
			onPress={onPress}
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
		alignItems: "center",
		justifyContent: "center",
		width: 150,
		height: 50,
		backgroundColor: "#637aff",
		borderRadius: 20,
		elevation: 3,
		marginTop: "auto",
		marginBottom: 10,
	},
	text: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
});
