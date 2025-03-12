import { Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import ButtonSecondary from "../../../components/themed/ButtonSecondary";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";

const AboutCodap = () => {
	const [modalVisible, setModalVisible] = useState(false);

	const { t } = useTranslation();

	return (
		<>
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
				}}
			>
				<CenterView style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
					<ThemedView style={styles.modalView}>
						<Pressable
							style={styles.button}
							onPress={() => setModalVisible(!modalVisible)}
						>
							<Icon
								type="ionicon"
								name="close-circle"
								color={"#5469D3"}
							/>
						</Pressable>
						<ScrollView style={{ marginBottom: 5 }}>
							<ResizableText
								useCustomColor
								style={styles.modalText}
								defaultSize={20}
							>
								{t("about")}:
							</ResizableText>
							<ResizableText
								useCustomColor
								style={styles.modalText}
								defaultSize={18}
							>
								{t("dev")}
							</ResizableText>
							<ResizableText
								style={[styles.modalText]}
								defaultSize={16}
							>
								{t("GTS")}
							</ResizableText>
							<ResizableText
								style={[styles.modalText]}
								defaultSize={16}
							>
								{t("GRP")}
							</ResizableText>
							<ResizableText
								useCustomColor
								style={styles.modalText}
								defaultSize={17}
							>
								{t("dev_note")}
							</ResizableText>
							<ResizableText
								style={[
									styles.devText,
									{
										marginLeft: 8,
										marginRight: 8,
									},
								]}
								defaultSize={16}
							>
								{t("dev_note2")}
							</ResizableText>
							<ResizableText
								useCustomColor
								style={styles.modalText}
								defaultSize={18}
							>
								{t("special thanks")}
							</ResizableText>
							<ResizableText
								style={[styles.thanksText]}
								defaultSize={16}
							>
								{t("names")}
							</ResizableText>
							<ResizableText
								useCustomColor
								style={styles.modalText}
								defaultSize={18}
							>
								{t("declaration")}
							</ResizableText>
							<ResizableText
								style={[styles.modalText]}
								defaultSize={16}
							>
								{t("pictures")}
							</ResizableText>
						</ScrollView>
					</ThemedView>
				</CenterView>
			</Modal>
			<ButtonSecondary
				title={t("about")}
				onPress={() => setModalVisible(true)}
			/>
		</>
	);
};

export default AboutCodap;

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		height: "65%",
		width: "90%",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 8,
	},
	button: {
		margin: 10,
	},
	modalText: {
		color: "#5469D3",
		fontWeight: "bold",
		marginBottom: 15,
		marginLeft: 10,
		textAlign: "left",
	},
	devText: {
		color: "#5469D3",
		fontWeight: "bold",
		marginLeft: 10,
		textAlign: "justify",
	},
	thanksText: {
		color: "#5469D3",
		fontWeight: "bold",
		marginBottom: 15,
		marginLeft: 10,
		textAlign: "left",
	},
});
