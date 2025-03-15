import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import useFontSizeStore from "../../../stores/FontSizeStore";
import ResizableText from "../../../components/ResizableText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SecondaryButton from "./SecondaryButton";
import SettingsButton from "./SettingsButton";
import ColumnView from "../../../components/layout/ColumnView";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";

const FontSizeChanger = () => {
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
				statusBarTranslucent
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
							defaultSize={20}
							style={styles.modalText}
						>
							{t("Change font size")}
						</ResizableText>
						<ColumnView justify={"flex-start"} align={"flex-start"}>
							<SettingsButton
								title={t("increase")}
								onPress={increment}
							/>
							<SettingsButton
								title={t("decrease")}
								onPress={decrement}
							/>
						</ColumnView>
					</ThemedView>
				</CenterView>
			</Modal>
			<SecondaryButton
				title={t("font")}
				onPress={() => setModalVisible(true)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderColor: "#637aff",
		borderWidth: 1,
		borderRadius: 20,
		height: "45%",
		width: "90%",
	},
	button: {
		margin: 10,
		alignSelf: "flex-end",
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
