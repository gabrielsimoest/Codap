import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../translations/i18n/i18n";

const useLanguage = () => {
	const [language, setLanguage] = useState<string>("pt");

	useEffect(() => {
		const getLanguageFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("@language_key");
				if (value) {
					setLanguage(value);
					i18n.changeLanguage(value);
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
