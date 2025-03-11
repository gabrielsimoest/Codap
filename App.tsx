import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	const setTheme = useThemeStore((s) => s.setTheme);

	useEffect(() => {
		if (theme) {
			setTheme(theme);
			SplashScreen.hide();
		}
	}, [theme]);

	return <MainNavigation />;
}
