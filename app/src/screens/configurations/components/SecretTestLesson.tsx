import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import ThemedView from "../../../components/themed/ThemedView";
import ClassView from "../../classes/components/ClassView";
import useLanguageStore from "../../../stores/LanguageStore";
import { activityGallery } from "../activityGallery";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

/**
 * Galeria de atividades (`activityGallery.ts`): um exemplar de cada tela de
 * atividade, para revisar o visual. Aberta segurando o botão "Sobre" por 5
 * segundos nas configurações — não aparece em lugar nenhum do app.
 *
 * A lista rola dentro do cartão: são mais entradas do que cabem na tela, e o
 * cabeçalho com o botão de fechar fica fixo em cima.
 */
export default function SecretTestLesson({ visible, onDismiss }: Props) {
	const language = useLanguageStore((s) => s.language);
	const entries = activityGallery[language as "pt" | "en"];

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
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
});
