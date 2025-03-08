import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DarkMode from "../theme/DarkMode";
import LightMode from "../theme/LightMode";
import { Theme } from "@react-navigation/native";

const useCustomTheme = () => {
	const [currentTheme, setCurrentTheme] = useState<Theme>(LightMode);

	useEffect(() => {
		const getThemeFromStorage = async () => {
			try {
				const themeFromStorage = await AsyncStorage.getItem(
					"CurrentTheme"
				);
				if (themeFromStorage) {
					const parsedTheme = JSON.parse(themeFromStorage);
					setCurrentTheme(
						parsedTheme === DarkMode ? DarkMode : LightMode
					);
				}
			} catch (error) {
				console.log(error);
			}
		};

		getThemeFromStorage();
	}, []);

	return currentTheme;
};

export default useCustomTheme;
