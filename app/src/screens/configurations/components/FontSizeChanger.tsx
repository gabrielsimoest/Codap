import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import useFontSizeStore from "../../../stores/FontSizeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import ListRow from "../../../components/ListRow";

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
		<>
			<AppModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				title={t("Change font size")}
			>
				<View style={styles.buttons}>
					<AppButton
						variant="secondary"
						title={t("decrease")}
						onPress={decrement}
					/>
					<AppButton title={t("increase")} onPress={increment} />
				</View>
			</AppModal>
			<ListRow
				title={t("font")}
				icon={{ type: "ionicon", name: "text-outline" }}
				onPress={() => setModalVisible(true)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	buttons: {
		gap: 12,
	},
});

export default FontSizeChanger;
