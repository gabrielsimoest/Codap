import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import MainNavigation from "./src/routes/MainNavigation";

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	return <MainNavigation theme={theme} />;
}
