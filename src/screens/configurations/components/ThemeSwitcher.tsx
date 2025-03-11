import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Button, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import { Theme, useTheme } from "@react-navigation/native";
import DarkMode from "../../../theme/DarkMode";
import useThemeStore from "../../../stores/ThemeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
		<TouchableOpacity
			style={[
				styles.button,
				{ backgroundColor: theme.colors.background },
			]}
			onPress={ChangeTheme}
		>
			<Text style={[styles.text, { color: theme.colors.text }]}>
				{t("theme")}
			</Text>
			<Switch
				style={{ marginTop: 5 }}
				value={isSwitchOn}
				color={"#5469D3"}
				onChange={ChangeTheme}
			/>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		backgroundColor: "#141f29",
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 7,
	},
	text: {
		color: "white",
	},
});

export default ThemeSwitcher;
