import { StyleSheet, ScrollView, View } from "react-native";
import EdgeFade, { HEADER_FADE } from "../../components/layout/EdgeFade";
import { TAB_BAR_CLEARANCE } from "../../components/layout/tabBarMetrics";
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
	// Enquanto "Sobre" está pressionado, a lista não rola. No Android, quando
	// a tela tem o que rolar, o ScrollView toma o gesto assim que o dedo anda
	// alguns dp (o limiar de rolagem) e cancela o toque longo de 5 s da
	// galeria — com a tela inteira cabendo, isso não acontecia. Travar a
	// rolagem tira o ScrollView da disputa.
	const [holdingAbout, setHoldingAbout] = useState(false);

	return (
		<ThemedView style={{ flex: 1 }}>
			<ConfigHeader title={t("settings")} />
			<View style={styles.body}>
				<ScrollView
					style={styles.scroller}
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
					scrollEnabled={!holdingAbout}
				>
					<ConfigHeading title={t("system")} />
					<LanguageSelector />
					<FontSizeChanger />
					<ThemeSwitcher />
					<ConfigHeading title={t("notification")} />
					<NotificationSwitcher />
					<ConfigHeading title={t("informations")} />
					<VersionInfo />
					<AboutCodap
						onLongPress={() => setTestLessonVisible(true)}
						onHoldChange={setHoldingAbout}
					/>
				</ScrollView>
				<EdgeFade edge="top" height={HEADER_FADE} />
			</View>
			<SecretTestLesson
				visible={testLessonVisible}
				onDismiss={() => setTestLessonVisible(false)}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
	},
	scroller: {
		flex: 1,
	},
	// A rolagem vai até a borda da tela: é por trás da barra de abas que o degradê
	// de baixo (em TabNavigation) faz o conteúdo sumir.
	content: {
		paddingTop: HEADER_FADE,
		paddingHorizontal: 20,
		paddingBottom: TAB_BAR_CLEARANCE,
		gap: 12,
	},
});
