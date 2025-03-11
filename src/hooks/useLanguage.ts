import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../translations/i18n/i18n";

const useLanguage = () => {
	const [language, setLanguage] = useState<string>();

	useEffect(() => {
		const getLanguageFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("CurrentLanguage");
				if (value) {
					setLanguage(value);
					i18n.changeLanguage(value);
				} else {
					setLanguage("pt");
					i18n.changeLanguage("pt");
				}
			} catch (error) {
				console.error("Error retrieving language:", error);
			}
		};

		getLanguageFromStorage();
	}, []);

	return language;
};

export default useLanguage;
