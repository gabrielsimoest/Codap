import { StyleSheet, TouchableOpacity } from "react-native";
import ResizableText from "../../../components/ResizableText";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

interface Props {
	onPress: () => void;
}

export default function NextButton({ onPress }: Props) {
	const { colors } = useTheme();
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: colors.primary }]}
			onPress={onPress}
		>
			<ResizableText style={[styles.text]} defaultSize={20}>
				{t("next")}
			</ResizableText>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		position: "absolute",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "92%",
		left: 16,
		height: 50,
		bottom: 30,
		borderRadius: 20,
	},
	text: {
		fontFamily: "Roboto",
	},
});
