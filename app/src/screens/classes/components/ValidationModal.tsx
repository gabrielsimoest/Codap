import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Modal, Portal } from "react-native-paper";
import ThemedView from "../../../components/themed/ThemedView";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import Images from "../../../utils/imageIndexer";
import ThemedTouchableOpacity from "../../../components/themed/ThemedTouchableOpacity";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	correct: boolean;
	onProceed: () => void;
}

const ValidationModal = ({ visible, onDismiss, correct, onProceed }: Props) => {
	const { t } = useTranslation();

	return (
		<Portal>
			{/* Sem `contentContainerStyle={{ flex: 1 }}`: com ele o conteúdo
			    cobria a tela inteira e tocar fora do cartão não fechava nada —
			    o X era o único jeito de sair pela tela. Agora o fundo do Modal
			    do paper recebe o toque e chama `onDismiss`. */}
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
			>
				<ThemedView style={styles.modalView}>
					<TouchableOpacity
						style={styles.button}
						onPress={onDismiss}
						hitSlop={16}
						accessibilityRole="button"
						accessibilityLabel={t("close")}
					>
						<Icon
							type="ionicon"
							name="close-outline"
							color={"#33526E"}
							size={60}
						/>
					</TouchableOpacity>
					<View>
						<ResizableText style={styles.title} defaultSize={24}>
							{correct ? t("continue") : t("try again")}
						</ResizableText>
						<ResizableText style={styles.message} defaultSize={19}>
							{correct ? t("congrats") : t("oh no")}
						</ResizableText>
					</View>
					<Image
						style={styles.figure}
						source={correct ? Images.codyHappy : Images.codySad}
					/>
					{correct ? (
						<ThemedTouchableOpacity
							theme="primary"
							style={styles.continueButton}
							onPress={onProceed}
						>
							<ResizableText
								style={[styles.text]}
								defaultSize={20}
							>
								{t("next")}
							</ResizableText>
						</ThemedTouchableOpacity>
					) : null}
				</ThemedView>
			</Modal>
		</Portal>
	);
};

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderRadius: 20,
		paddingBottom: 35,
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		color: "#7977FD",
		marginBottom: 5,
		textAlign: "center",
		fontWeight: "bold",
	},
	message: {
		fontSize: 19,
		color: "#fff",
		marginBottom: 20,
		textAlign: "center",
	},
	continueButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
		height: 50,
		borderRadius: 20,
		marginTop: 20,
	},
	text: {
		fontFamily: "Roboto",
	},
	// Alvo de toque com tamanho próprio (e `hitSlop` no elemento), em vez de
	// só o ícone empurrado por `marginLeft: "83%"`: o X falhava às vezes.
	button: {
		alignSelf: "flex-end",
		width: 60,
		height: 60,
		marginTop: 8,
		marginRight: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	figure: {
		height: 200,
		width: 130,
	},
});

export default ValidationModal;
