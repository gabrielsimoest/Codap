import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/Icon";
import ResizableText from "../../../../components/ResizableText";
import { TEXT_SIZE, type TheoryPalette } from "./theoryTheme";
import { useInsets } from "./useInsets";

/** Altura do botão, para quem precisa reservar espaço embaixo da rolagem. */
export const THEORY_BUTTON_HEIGHT = 52;
/** Folga entre o botão e a borda inferior (já fora da área segura). */
export const THEORY_BUTTON_MARGIN = 16;

interface Props {
	palette: TheoryPalette;
	horizontalPadding: number;
	onPress: () => void;
}

/**
 * "Seguinte →" fixo no rodapé, acima da barra de gestos. O texto acompanha a
 * fonte do app (`ResizableText`); o botão tem altura mínima fixa e cresce se o
 * texto crescer.
 */
export default function TheoryNextButton({ palette, horizontalPadding, onPress }: Props) {
	const { t } = useTranslation();
	const { bottom } = useInsets();

	return (
		<TouchableOpacity
			accessibilityRole="button"
			onPress={onPress}
			style={[
				styles.button,
				{
					backgroundColor: palette.accent,
					left: horizontalPadding,
					right: horizontalPadding,
					bottom: bottom + THEORY_BUTTON_MARGIN,
				},
			]}
		>
			<ResizableText useCustomColor style={styles.text} defaultSize={TEXT_SIZE.button}>
				{t("next")}
			</ResizableText>
			<Icon type="ionicon" name="arrow-forward" color="#FFFFFF" size={20} />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		position: "absolute",
		minHeight: THEORY_BUTTON_HEIGHT,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		borderRadius: 14,
		paddingVertical: 12,
	},
	text: {
		color: "#FFFFFF",
		fontFamily: "Roboto",
		fontWeight: "600",
		verticalAlign: "middle",
		marginBottom: 2,
	},
});
