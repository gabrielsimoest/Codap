import { StyleSheet, TouchableOpacity } from "react-native";
import ResizableText from "../../../components/ResizableText";
import { useTheme } from "@react-navigation/native";

interface Props {
	title: string;
	onPress: () => void;
}

export default function SecondaryButton({ title, onPress }: Props) {
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: colors.background }]}
			onPress={onPress}
		>
			<ResizableText style={[styles.text]} defaultSize={20}>
				{title}
			</ResizableText>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 2,
	},
	text: {
		fontFamily: "Roboto",
	},
});
