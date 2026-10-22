import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import { Theme, useTheme } from "@react-navigation/native";
import DarkMode from "../../../theme/DarkMode";
import useThemeStore from "../../../stores/ThemeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ListRow from "../../../components/ListRow";
import { useAppColors } from "../../../theme/appColors";

const ThemeSwitcher = () => {
	const theme = useTheme();
	const app = useAppColors();
	const { t } = useTranslation();
	const [isSwitchOn, setIsSwitchOn] = useState(false);

	const toggleTheme = useThemeStore((s) => s.toggleTheme);

	const ChangeTheme = () => {
		setIsSwitchOn(!isSwitchOn);
		toggleTheme();
	};

	const persistTheme = async (theme: Theme) => {
		try {
			await AsyncStorage.setItem(
				"CurrentTheme",
				theme === DarkMode ? "dark" : "light"
			);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		persistTheme(theme);
	}, [theme]);

	useEffect(() => {
		if (theme === DarkMode) setIsSwitchOn(true);
	}, []);

	return (
		<ListRow
			title={t("theme")}
			icon={{ type: "ionicon", name: "moon-outline" }}
			onPress={ChangeTheme}
			right={
				<Switch
					accessibilityLabel={t("theme")}
					value={isSwitchOn}
					color={app.action}
					onChange={ChangeTheme}
				/>
			}
		/>
	);
};

export default ThemeSwitcher;
