import { DefaultTheme } from "@react-navigation/native";

const DarkMode = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		//Definir as cores
		background: "#141f29",
		text: "#F1F1F1",
		primary: "#1B2B39",
		card: "#0E151C",
		border: "#233648",
		notification: "#33526E",
	},
};

export default DarkMode;
