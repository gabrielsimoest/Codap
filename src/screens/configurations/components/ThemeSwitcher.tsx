import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import { Theme, useTheme } from "@react-navigation/native";
import DarkMode from "../../../theme/DarkMode";
import useThemeStore from "../../../stores/ThemeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ResizableText from "../../../components/ResizableText";
import ThemedView from "../../../components/themed/ThemedView";
import RowView from "../../../components/layout/RowView";

const ThemeSwitcher = () => {
	const theme = useTheme();
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
		<TouchableOpacity onPress={ChangeTheme}>
			<ThemedView style={styles.button}>
				<RowView align="center" justify="space-between">
					<ResizableText defaultSize={20}>{t("theme")}</ResizableText>
					<Switch
						style={{ marginTop: 5 }}
						value={isSwitchOn}
						color={"#5469D3"}
						onChange={ChangeTheme}
					/>
				</RowView>
			</ThemedView>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 2,
	},
});

export default ThemeSwitcher;
