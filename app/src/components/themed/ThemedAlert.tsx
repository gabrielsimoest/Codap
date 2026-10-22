import React from "react";
import { StyleSheet } from "react-native";
import AppButton from "../AppButton";
import AppModal from "../AppModal";
import ThemedText from "./ThemedText";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	title: string;
	message: string;
	buttonText: string;
}

/** Aviso do app: o `AppModal` com a mensagem e um botão de confirmação (sem o X do canto). */
const ThemedAlert = ({
	visible,
	onDismiss,
	title,
	message,
	buttonText,
}: Props) => {
	return (
		<AppModal
			visible={visible}
			onDismiss={onDismiss}
			title={title}
			hideClose
			footer={<AppButton title={buttonText.toUpperCase()} onPress={onDismiss} />}
		>
			<ThemedText style={styles.message}>{message}</ThemedText>
		</AppModal>
	);
};

const styles = StyleSheet.create({
	message: {
		fontSize: 18,
		lineHeight: 26,
	},
});

export default ThemedAlert;
