import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import AppModal from "../../../components/AppModal";
import ListRow from "../../../components/ListRow";
import ResizableText from "../../../components/ResizableText";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAppColors } from "../../../theme/appColors";

interface Props {
	/** Gesto escondido: segurar este botão abre a aula de teste (ver Config). */
	onLongPress?: () => void;
	/**
	 * Avisa quando o dedo começa e termina de segurar "Sobre". Quem tem a
	 * rolagem trava ela nesse intervalo: senão o dedo mexendo uns poucos dp
	 * durante os 5 s vira rolagem e cancela o toque longo.
	 */
	onHoldChange?: (holding: boolean) => void;
}

const AboutCodap = ({ onLongPress, onHoldChange }: Props) => {
	const [modalVisible, setModalVisible] = useState(false);

	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();

	const heading = [styles.heading, { color: app.brandText }];
	const body = [styles.body, { color: colors.text }];

	return (
		<>
			<AppModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				title={t("about")}
				scroll
			>
				<ResizableText useCustomColor style={heading} defaultSize={18}>
					{t("dev")}
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("GTS")}
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("GRP")}
				</ResizableText>
				<ResizableText useCustomColor style={heading} defaultSize={17}>
					{t("dev_note")}
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("dev_note2")}
				</ResizableText>
				<ResizableText useCustomColor style={heading} defaultSize={18}>
					{t("special thanks")}
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("names")}
				</ResizableText>
				<ResizableText useCustomColor style={heading} defaultSize={18}>
					{t("declaration")}
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("pictures")}
				</ResizableText>
			</AppModal>
			<ListRow
				title={t("about")}
				icon={{ type: "ionicon", name: "people-outline" }}
				onPress={() => setModalVisible(true)}
				onLongPress={onLongPress}
				delayLongPress={5000}
				onPressIn={() => onHoldChange?.(true)}
				onPressOut={() => onHoldChange?.(false)}
			/>
		</>
	);
};

export default AboutCodap;

const styles = StyleSheet.create({
	heading: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: 14,
		marginBottom: 6,
	},
	body: {
		fontFamily: "Roboto",
		lineHeight: 22,
	},
});
