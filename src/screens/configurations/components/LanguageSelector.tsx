import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import ResizableText from "../../../components/ResizableText";
import useLanguageStore from "../../../stores/LanguageStore";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import ButtonSecondary from "../../../components/themed/ButtonSecondary";
import SettingsButton from "./SettingsButton";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";

const textSize = 20;

export default function LanguageSelector() {
	const [modalVisible, setModalVisible] = useState(false);
	const { colors } = useTheme();

	const { t } = useTranslation();

	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const language = useLanguageStore((s) => s.language);

	return (
		<View>
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
								type={"ionicon"}
								name="close-circle"
								color={"#5469D3"}
							/>
						</Pressable>
						<ResizableText
							useCustomColor
							style={styles.modalText}
							defaultSize={textSize}
						>
							{t("select the language:")}
						</ResizableText>
						<ScrollView style={{ marginBottom: 5 }}>
							<SettingsButton
								title="PORTUGUÊS"
								textStyle={{
									color:
										language === "pt"
											? "#5469D3"
											: colors.text,
								}}
								disabled={language === "pt"}
								onPress={() => setLanguage("pt")}
							/>
							<SettingsButton
								title="ENGLISH"
								textStyle={{
									color:
										language === "en"
											? "#5469D3"
											: colors.text,
								}}
								disabled={language === "en"}
								onPress={() => setLanguage("en")}
							/>
						</ScrollView>
					</ThemedView>
				</CenterView>
			</Modal>
			<ButtonSecondary
				title={t("language")}
				onPress={() => setModalVisible(true)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		height: "50%",
		width: "90%",
	},
	button: {
		margin: 10,
	},
	modalText: {
		color: "#5469D3",
		fontWeight: "bold",
		marginBottom: 15,
		marginLeft: 10,
		fontSize: 20,
	},
});
