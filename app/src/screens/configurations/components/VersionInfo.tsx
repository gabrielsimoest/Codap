import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import AppModal from "../../../components/AppModal";
import ListRow from "../../../components/ListRow";
import ResizableText from "../../../components/ResizableText";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAppColors } from "../../../theme/appColors";

const VersionInfo = () => {
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
				title={t("version")}
				scroll
			>
				<ResizableText useCustomColor style={body} defaultSize={20}>
					1.0.0
				</ResizableText>
				<ResizableText useCustomColor style={heading} defaultSize={18}>
					{t("update")}
				</ResizableText>
				<ResizableText useCustomColor style={[body, styles.bold]} defaultSize={18}>
					1.0.0
				</ResizableText>
				<ResizableText useCustomColor style={body} defaultSize={16}>
					{t("changes")}
				</ResizableText>
			</AppModal>
			<ListRow
				title={t("version")}
				icon={{ type: "ionicon", name: "pricetag-outline" }}
				onPress={() => setModalVisible(true)}
			/>
		</>
	);
};

export default VersionInfo;

const styles = StyleSheet.create({
	heading: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: 18,
		marginBottom: 6,
	},
	body: {
		fontFamily: "Roboto",
		lineHeight: 22,
	},
	bold: {
		fontWeight: "bold",
	},
});
