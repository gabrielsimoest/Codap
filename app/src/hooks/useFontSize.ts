import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useFontSize = () => {
	const [fontSize, setFontSize] = useState<number>();

	useEffect(() => {
		const getFontSizeFromStorage = async () => {
			try {
				const fontSizeFromStorage = await AsyncStorage.getItem(
					"CurrentFontSize"
				);
				setFontSize(
					fontSizeFromStorage ? JSON.parse(fontSizeFromStorage) : 0
				);
			} catch (error) {
				console.log(error);
			}
		};

		getFontSizeFromStorage();
	}, []);

	return fontSize;
};

export default useFontSize;
