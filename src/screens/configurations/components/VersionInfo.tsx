import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import ButtonSecondary from "../../../components/themed/ButtonSecondary";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ThemedLine from "../../../components/themed/ThemedLine";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";

const VersionInfo = () => {
	/* const navigation = useNavigation(); */

	const [modalVisible, setModalVisible] = useState(false);

	/* var pressCounter = 0;

    const onPressHandler = () => {
        //setPressCounter(pressCounter++);
        pressCounter++;
        if(pressCounter >= 5) {
            pressCounter = 0;
            setModalVisible(!modalVisible);
            navigation.navigate("Tester");
        }
    } */

	const { t } = useTranslation();

	return (
		<>
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					/* pressCounter = 0; */
					setModalVisible(!modalVisible);
				}}
			>
				<CenterView style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
					<ThemedView style={styles.modalView}>
						<Pressable
							style={styles.button}
							onPress={() => {
								/* pressCounter =0;  */
								setModalVisible(!modalVisible);
							}}
						>
							<Icon
								type="ionicon"
								name="close-circle"
								color={"#5469D3"}
							/>
						</Pressable>
						<ScrollView style={{ marginBottom: 5 }}>
							{/* <Pressable onPress={onPressHandler}  >
                                <ResizableText style={styles.modalText} defaultSize={20}>{t("version")}:</ResizableText>
                            </Pressable> */}
							<ResizableText
								style={styles.modalText}
								useCustomColor
								defaultSize={20}
							>
								{t("version")}:
							</ResizableText>
							<ResizableText
								style={[styles.text]}
								defaultSize={20}
							>
								1.0.0
							</ResizableText>
							<ThemedLine style={styles.line} theme={"primary"} />
							<ResizableText
								style={[styles.modalText, { marginTop: "5%" }]}
								useCustomColor
								defaultSize={20}
							>
								{t("update")}:
							</ResizableText>
							<ResizableText
								style={[styles.text]}
								defaultSize={20}
							>
								1.0.0:
							</ResizableText>
							<ResizableText
								style={[styles.text]}
								defaultSize={18}
							>
								{t("changes")}
							</ResizableText>
							<ThemedLine style={styles.line} theme={"primary"} />
						</ScrollView>
					</ThemedView>
				</CenterView>
			</Modal>
			<ButtonSecondary
				title={t("version")}
				onPress={() => setModalVisible(true)}
			/>
		</>
	);
};

export default VersionInfo;

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		height: "65%",
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
		textAlign: "left",
	},
	text: {
		fontWeight: "bold",
		marginBottom: 15,
		marginLeft: 10,
		textAlign: "left",
	},
	line: {
		margin: 20,
		marginLeft: 15,
		marginRight: 15,
	},
});
