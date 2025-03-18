import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import useFontSizeStore from "./src/stores/FontSizeStore";
import useLanguageStore from "./src/stores/LanguageStore";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-native-paper";
import useAlertStore from "./src/stores/AlertStore";
import ThemedAlert from "./src/components/themed/ThemedAlert";

SplashScreen.preventAutoHideAsync();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	const setTheme = useThemeStore((s) => s.setTheme);
	const themeStored = useThemeStore((s) => s.theme);
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
		<NavigationContainer theme={themeStored}>
			<Provider>
				<MainNavigation />
				{alertVisible && (
					<ThemedAlert
						title={alertMessage.title}
						message={alertMessage.message}
						buttonText={alertMessage.buttonText}
						visible={alertVisible}
						onDismiss={() => {
							setAlertVisible(false);
						}}
					/>
				)}
			</Provider>
		</NavigationContainer>
	);
}
