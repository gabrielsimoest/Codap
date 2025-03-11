import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import {
	Button,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import ResizableText from "../../../components/ResizableText";
import useLanguageStore from "../../../stores/LanguageStore";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";

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
				<View style={styles.centeredView}>
					<View
						style={[
							styles.modalView,
							{ backgroundColor: colors.background },
						]}
					>
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
							style={styles.modalText}
							defaultSize={textSize}
						>
							{t("select the language:")}
						</ResizableText>
						<ScrollView style={{ marginBottom: 5 }}>
							<Button
								title="PORTUGUÊS"
								onPress={() => setLanguage("pt")}
							/>
							<Button
								title="ENGLISH"
								onPress={() => setLanguage("en")}
							/>
						</ScrollView>
					</View>
				</View>
			</Modal>
			<Button
				title={t("language")}
				onPress={() => setModalVisible(true)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.85)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalView: {
		margin: 20,
		backgroundColor: "#141f29",
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		height: "50%",
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
		fontSize: 20,
	},
});
