import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import ResizableText from "./ResizableText";
import Icon from "./Icon";
import ThemedView from "./themed/ThemedView";
import Images from "../utils/imageIndexer";
import { Modal, Portal } from "react-native-paper";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

const ComingSoon = ({ visible = false, onDismiss }: Props) => {
	const { t } = useTranslation();

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
					<TouchableOpacity style={styles.button} onPress={onDismiss}>
						<Icon
							type="ionicon"
							name="close-outline"
							color={"#33526E"}
							size={60}
							//style={styles.icon}
						/>
					</TouchableOpacity>
					<View style={{ margin: 10 }}>
						<ResizableText style={styles.title} defaultSize={24}>
							{t("comingSoon.title")}
						</ResizableText>
						<ResizableText style={styles.message} defaultSize={19}>
							{t("comingSoon.message")}
						</ResizableText>
					</View>
					<Image style={styles.figure} source={Images.codyBuilding} />
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
		marginBottom: "8%",
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
		marginLeft: "83%",
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

export default ComingSoon;
