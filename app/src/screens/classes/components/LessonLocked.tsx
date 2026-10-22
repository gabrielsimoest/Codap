import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";

interface Props {
	/** O nível que abre a aula. */
	minLevel: number;
}

/**
 * O que a tela de lição mostra no lugar das atividades quando a aula de
 * aprofundamento ainda está bloqueada para o nível da pessoa (um deep link, por
 * exemplo, chega aqui sem passar pela lista). Não roda nada nem paga XP.
 */
export default function LessonLocked({ minLevel }: Props) {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<Icon type="ionicon" name="lock-closed-outline" color="#5b6b7a" size={72} />
			<ResizableText style={styles.title} defaultSize={24}>
				{t("levels.lockedLesson.title")}
			</ResizableText>
			<ResizableText style={styles.message} defaultSize={18}>
				{t("levels.lockedLesson.message", { level: minLevel })}
			</ResizableText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
		gap: 16,
	},
	title: {
		fontWeight: "bold",
		textAlign: "center",
	},
	message: {
		textAlign: "center",
	},
});
