import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import useFontSizeStore from "./src/stores/FontSizeStore";
import useLanguageStore from "./src/stores/LanguageStore";
import useAlertStore from "./src/stores/AlertStore";
import ThemedAlert from "./src/components/themed/ThemedAlert";
import LightMode from "./src/theme/LightMode";

SplashScreen.preventAutoHideAsync();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	const setTheme = useThemeStore((s) => s.setTheme);
	const setFontSize = useFontSizeStore((s) => s.setFontSize);
	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const alertVisible = useAlertStore((S) => S.alertVisible);
	const alertMessage = useAlertStore((S) => S.alertMessage);
	const setAlertVisible = useAlertStore((S) => S.setAlertVisible);

	useEffect(() => {
		if (
			theme !== undefined &&
			fontSize !== undefined &&
			language !== undefined
		) {
			setTheme(theme);
			setFontSize(fontSize);
			setLanguage(language);
			setTimeout(() => SplashScreen.hide(), 100);
		}
	}, [theme, fontSize, language]);

	return (
		<>
			<MainNavigation />
			{alertVisible && (
				<ThemedAlert
					theme={theme !== undefined ? theme : LightMode}
					title={alertMessage.title}
					message={alertMessage.message}
					buttonText={alertMessage.buttonText}
					visible={alertVisible}
					onDismiss={() => {
						setAlertVisible(false);
					}}
				/>
			)}
		</>
	);
}
