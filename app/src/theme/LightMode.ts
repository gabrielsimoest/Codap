import { DefaultTheme } from "@react-navigation/native";

const LightMode = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		//Definir as cores
		background: "#FFFF",
		text: "#000",
		primary: "#F1F1F1",
		card: "#DEDFE1",
		border: "#E5E5E5",
		notification: "#F5F5F5",
	},
};

export default LightMode;
