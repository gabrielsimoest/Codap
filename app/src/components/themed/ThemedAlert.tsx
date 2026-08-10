import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	title: string;
	message: string;
	buttonText: string;
}

const ThemedAlert = ({
	visible,
	onDismiss,
	title,
	message,
	buttonText,
}: Props) => {
	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={{ flex: 1 }}
				style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
				dismissableBackButton
			>
				<ThemedView style={styles.modalView}>
					<Text style={styles.title}>{title}</Text>
					<ThemedText style={styles.message}>{message}</ThemedText>

					<TouchableOpacity style={styles.button} onPress={onDismiss}>
						<Text style={styles.buttonText}>
							{buttonText.toUpperCase()}
						</Text>
					</TouchableOpacity>
				</ThemedView>
			</Modal>
		</Portal>
	);
};

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		backgroundColor: "#141f29",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	title: {
		fontSize: 24,
		color: "#7977FD",
		marginBottom: 20,
		textAlign: "center",
		fontWeight: "bold",
	},
	message: {
		fontSize: 19,
		color: "#fff",
		marginBottom: 15,
		textAlign: "center",
	},
	button: {
		backgroundColor: "#7977FD",
		borderRadius: 20,
		padding: 10,
		paddingLeft: 45,
		paddingRight: 45,
		elevation: 2,
		marginTop: 15,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
		fontSize: 20,
	},
});

export default ThemedAlert;
