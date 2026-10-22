import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLanguageStore from "../../../stores/LanguageStore";
import { useTranslation } from "react-i18next";
import AppModal from "../../../components/AppModal";
import Flag from "../../../components/Flag";
import Icon from "../../../components/Icon";
import ListRow from "../../../components/ListRow";
import { useAppColors } from "../../../theme/appColors";

export default function LanguageSelector() {
	const [modalVisible, setModalVisible] = useState(false);

	const { t } = useTranslation();
	const app = useAppColors();

	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const language = useLanguageStore((s) => s.language);

	const persistLanguage = async (language: string) => {
		try {
			await AsyncStorage.setItem("CurrentLanguage", language);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		persistLanguage(language);
	}, [language]);

	return (
		<>
			<AppModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				title={t("select the language:")}
			>
				<View style={styles.options}>
					<ListRow
						title="Português"
						leading={<Flag country="br" />}
						noChevron
						selected={language === "pt"}
						onPress={() => setLanguage("pt")}
					/>
					<ListRow
						title="English"
						leading={<Flag country="us" />}
						noChevron
						selected={language === "en"}
						onPress={() => setLanguage("en")}
					/>
				</View>
			</AppModal>
			<ListRow
				title={t("language")}
				icon={{ type: "ionicon", name: "language-outline" }}
				onPress={() => setModalVisible(true)}
				// A bandeira do idioma atual aparece na linha, antes da seta.
				right={
					<View style={styles.current}>
						<Flag country={language === "pt" ? "br" : "us"} width={30} />
						<Icon type="ionicon" name="chevron-forward" size={20} color={app.muted} />
					</View>
				}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	options: {
		gap: 12,
	},
	current: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});
