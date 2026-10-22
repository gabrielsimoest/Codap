import { useAppColors } from "../../../theme/appColors";
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
}

export default function ModalButtonUser({ title, onPress, textStyle }: Props) {
	const app = useAppColors();
	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: app.action }]}
			onPress={onPress}
		>
			<ResizableText
				useCustomColor
				style={[styles.text, { color: app.onBrand }, textStyle]}
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
		marginTop: 30,
		marginBottom: 20,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 16,
		height: 50,
		borderRadius: 20,
		backgroundColor: "#637aff",
	},
	text: {
		fontFamily: "Roboto",
	},
});
