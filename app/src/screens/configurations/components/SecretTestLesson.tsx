import { Pressable, StyleSheet } from "react-native";
import { Modal, Portal } from "react-native-paper";
import Icon from "../../../components/Icon";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";
import ClassList from "../../classes/components/ClassList";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

/**
 * Acesso escondido ao conteúdo de aula hardcoded (`lessons/html/content`), que
 * não vem da API e por isso não aparece na lista de lições de nenhum módulo.
 * Aberto segurando o botão "Sobre" por 5 segundos nas configurações.
 *
 * Existe só para manter esse conteúdo de teste alcançável — é autocontido de
 * propósito, para poder sumir junto com o conteúdo quando ele não for mais
 * necessário.
 */
export default function SecretTestLesson({ visible, onDismiss }: Props) {
	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={{ flex: 1 }}
				style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
				dismissableBackButton
			>
				<CenterView style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
					<ThemedView style={styles.modalView}>
						<Pressable style={styles.close} onPress={onDismiss}>
							<Icon
								type="ionicon"
								name="close-circle"
								color={"#5469D3"}
							/>
						</Pressable>
						<ClassList topic="HTML" moduleType="basic" />
					</ThemedView>
				</CenterView>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		width: "90%",
		paddingBottom: 20,
	},
	close: {
		margin: 10,
		alignSelf: "flex-end",
	},
});
