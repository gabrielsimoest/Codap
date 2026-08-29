import { StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import ConfigHeader from "./components/ConfigHeader";
import ThemeSwitcher from "./components/ThemeSwitcher";
import FontSizeChanger from "./components/FontSizeChanger";
import LanguageSelector from "./components/LanguageSelector";
import ThemedView from "../../components/themed/ThemedView";
import ConfigHeading from "./components/ConfigHeading";
import NotificationSwitcher from "./components/NotificationSwitcher";
import VersionInfo from "./components/VersionInfo";
import AboutCodap from "./components/AboutCodap";
import SecretTestLesson from "./components/SecretTestLesson";
import { useState } from "react";

export default function Config() {
	const { t } = useTranslation();
	const [testLessonVisible, setTestLessonVisible] = useState(false);

	return (
		<ThemedView style={{ flex: 1 }}>
			<ConfigHeader title={t("settings")} />
			<ScrollView
				style={styles.scroller}
				showsVerticalScrollIndicator={false}
			>
				<ConfigHeading
					iconType="materialCommunity"
					iconName="cellphone-cog"
					title={t("system")}
				/>
				<LanguageSelector />
				<FontSizeChanger />
				<ThemeSwitcher />
				<ConfigHeading
					iconType="ionicon"
					iconName="notifications"
					title={t("notification")}
				/>
				<NotificationSwitcher />
				<ConfigHeading
					iconType="materialCommunity"
					iconName="information-outline"
					title={t("informations")}
				/>
				<VersionInfo />
				<AboutCodap
					onLongPress={() => setTestLessonVisible(true)}
				/>
			</ScrollView>
			<SecretTestLesson
				visible={testLessonVisible}
				onDismiss={() => setTestLessonVisible(false)}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	scroller: {
		width: "90%",
		marginLeft: "5%",
		marginBottom: "18%",
	},
	text: {
		color: "#5469D3",
		fontSize: 25,
		marginRight: 10,
	},

	icon: {
		marginRight: 10,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		backgroundColor: "#141f29",
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 7,
	},
});
