import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import useFontSizeStore from "./src/stores/FontSizeStore";

SplashScreen.preventAutoHideAsync();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	const setTheme = useThemeStore((s) => s.setTheme);
	const setFontSize = useFontSizeStore((s) => s.setFontSize);

	useEffect(() => {
		if (theme && fontSize && language) {
			setTheme(theme);
			setFontSize(fontSize);
			SplashScreen.hide();
		}
	}, [theme, fontSize, language]);

	return <MainNavigation />;
}
