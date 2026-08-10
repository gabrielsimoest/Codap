import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useLanguage = () => {
	const [language, setLanguage] = useState<string>();

	useEffect(() => {
		const getLanguageFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("CurrentLanguage");
				if (value) {
					setLanguage(value);
				} else {
					setLanguage("pt");
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
