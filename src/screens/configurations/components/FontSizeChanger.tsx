import React, { useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, Pressable, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import Icon from "../../../components/Icon";
import { Button } from "react-native-paper";
import useFontSizeStore from "../../../stores/FontSizeStore";
import ResizableText from "../../../components/ResizableText";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FontSizeChanger = () => {
	const { colors } = useTheme(); //Variavel de cor do tema

	const [modalVisible, setModalVisible] = useState(false);

	const { t } = useTranslation();

	const increment = useFontSizeStore((s) => s.increment);
	const decrement = useFontSizeStore((s) => s.decrement);
	const fontSize = useFontSizeStore((s) => s.fontSize);

	const persistFontSize = async (fontSize: number) => {
		try {
			await AsyncStorage.setItem(
				"CurrentFontSize",
				JSON.stringify(fontSize)
			);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		persistFontSize(fontSize);
	}, [fontSize]);

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
						<ResizableText style={styles.modalText}>
							{t("Change font size")}
						</ResizableText>
						<View style={{ display: "flex", flexDirection: "row" }}>
							<Button onPress={increment}>Aumentar</Button>
							<Button onPress={decrement}>Diminuir</Button>
						</View>
					</View>
				</View>
			</Modal>
			<Button onPress={() => setModalVisible(true)}>{t("font")}</Button>
			{/* <OpButton theme='secundaryButton' textStyle='text2' title={t("font")} onPressFunction={() => setModalVisible(true)} /> */}
		</View>
	);
};

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
		height: "45%",
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
	buttonOpen: {
		backgroundColor: "#F194FF",
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		fontSize: 18,
		marginLeft: 30,
		marginTop: 10,
		color: "white",
	},
	modalText: {
		color: "#5469D3",
		fontWeight: "bold",
		marginBottom: 15,
		marginLeft: 10,
		fontSize: 20,
	},
});

export default FontSizeChanger;
