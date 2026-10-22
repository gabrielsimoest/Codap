import { useAppColors } from "../../../theme/appColors";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import ThemedView from "../../../components/themed/ThemedView";
import ClassButton from "../../classes/components/ClassButton";
import ClassView from "../../classes/components/ClassView";
import useLanguageStore from "../../../stores/LanguageStore";
import { activityGallery } from "../activityGallery";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

/**
 * Os quatro estados visuais da lista de lições que não dão para ver numa conta
 * qualquer — aula do baú, aprofundamento bloqueado e liberado, e o desafio do
 * módulo. São o `ClassButton` de verdade, só sem ação ao toque.
 */
const lessonButtons = {
	pt: [
		{ title: "Aula exclusiva do baú", chest: true },
		{ title: "Aula de aprofundamento", deepening: true, lockedLevel: 5 },
		{ title: "Aula de aprofundamento", deepening: true },
		{ title: "Testando seus conhecimentos", challenge: true },
	],
	en: [
		{ title: "Chest exclusive lesson", chest: true },
		{ title: "Deep-dive lesson", deepening: true, lockedLevel: 5 },
		{ title: "Deep-dive lesson", deepening: true },
		{ title: "Testing your knowledge", challenge: true },
	],
};

/**
 * Galeria de atividades (`activityGallery.ts`): um exemplar de cada tela de
 * atividade, para revisar o visual. Aberta segurando o botão "Sobre" por 5
 * segundos nas configurações — não aparece em lugar nenhum do app.
 *
 * A lista rola dentro do cartão: são mais entradas do que cabem na tela, e o
 * cabeçalho com o botão de fechar fica fixo em cima.
 */
export default function SecretTestLesson({ visible, onDismiss }: Props) {
	const app = useAppColors();
	const language = useLanguageStore((s) => s.language);
	const entries = activityGallery[language as "pt" | "en"];

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				style={{ backgroundColor: app.scrim }}
				dismissableBackButton
			>
				<ThemedView style={styles.card}>
					<View style={styles.header}>
						<ResizableText style={styles.title} defaultSize={20}>
							{language === "en" ? "Activity gallery" : "Galeria de atividades"}
						</ResizableText>
						<Pressable
							onPress={onDismiss}
							hitSlop={12}
							accessibilityRole="button"
							accessibilityLabel={language === "en" ? "Close" : "Fechar"}
						>
							<Icon type="ionicon" name="close-circle" color={"#5469D3"} />
						</Pressable>
					</View>
					<ScrollView contentContainerStyle={styles.list}>
						{entries.map((entry, index) => (
							<ClassView key={index} classes={entry.classes} title={entry.title} />
						))}

						{/* Só para ver o contorno e a aparência: os botões da lista de lições, sem função. */}
						<ResizableText style={styles.sectionTitle} defaultSize={16}>
							{language === "en"
								? "Lesson list buttons (look only)"
								: "Botões da lista de lições (só visual)"}
						</ResizableText>
						{lessonButtons[language === "en" ? "en" : "pt"].map((button, index) => (
							<ClassButton key={index} {...button} onPress={() => undefined} />
						))}
					</ScrollView>
				</ThemedView>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	card: {
		alignSelf: "center",
		width: "90%",
		maxHeight: "85%",
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		overflow: "hidden",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#304D66",
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		color: "#5469D3",
	},
	list: {
		paddingTop: 16,
		paddingBottom: 8,
	},
	sectionTitle: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 24,
		marginBottom: 16,
	},
});
