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
	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
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
