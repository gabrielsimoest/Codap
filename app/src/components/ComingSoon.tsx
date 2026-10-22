import React from "react";
import { Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import AppModal from "./AppModal";
import ResizableText from "./ResizableText";
import Images from "../utils/imageIndexer";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

const ComingSoon = ({ visible = false, onDismiss }: Props) => {
	const { t } = useTranslation();

	return (
		<AppModal visible={visible} onDismiss={onDismiss} title={t("comingSoon.title")}>
			<ResizableText style={styles.message} defaultSize={18}>
				{t("comingSoon.message")}
			</ResizableText>
			<Image style={styles.figure} source={Images.codyBuilding} resizeMode="contain" />
		</AppModal>
	);
};

const styles = StyleSheet.create({
	message: {
		textAlign: "center",
		fontFamily: "Roboto",
	},
	figure: {
		height: 180,
		width: 118,
		alignSelf: "center",
		marginTop: 12,
	},
});

export default ComingSoon;
