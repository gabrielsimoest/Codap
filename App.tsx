import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";

const Stack = createStackNavigator();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();

	return (
		<NavigationContainer theme={theme}>
			<Stack.Navigator screenOptions={{ header: () => null }}>
				<Stack.Screen name="Login" component={Login} />
				<Stack.Screen name="Register" component={Register} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
