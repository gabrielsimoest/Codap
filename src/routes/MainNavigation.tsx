import { NavigationContainer, Theme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import { TabNavigation } from "./TabNavigation";

const Stack = createStackNavigator();

export default function MainNavigation({ theme }: { theme: Theme }) {
	return (
		<NavigationContainer theme={theme}>
			<Stack.Navigator screenOptions={{ header: () => null }}>
				<Stack.Screen name="Login" component={Login} />
				<Stack.Screen name="Register" component={Register} />
				<Stack.Screen name="Home" component={TabNavigation} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
