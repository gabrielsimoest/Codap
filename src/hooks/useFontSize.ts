import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useFontSize = () => {
	const [fontSize, setFontSize] = useState<number>(0);

	useEffect(() => {
		const getFontSizeFromStorage = async () => {
			try {
				const fontSizeFromStorage = await AsyncStorage.getItem(
					"CurrentFontSize"
				);
				setFontSize((prevFontSize) =>
					fontSizeFromStorage
						? JSON.parse(fontSizeFromStorage)
						: prevFontSize
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
