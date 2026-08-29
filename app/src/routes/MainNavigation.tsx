import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import { TabNavigation } from "./TabNavigation";
import Lesson from "../screens/classes/Lesson";
import type { RootStackParamList } from "../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

interface Props {
	isLoggedIn: boolean;
}

export default function MainNavigation({ isLoggedIn }: Props) {
	return (
		<Stack.Navigator
			screenOptions={{ header: () => null }}
			initialRouteName={isLoggedIn ? "Home" : "Login"}
		>
			<Stack.Screen name="Login" component={Login} />
			<Stack.Screen name="Register" component={Register} />
			<Stack.Screen name="Home" component={TabNavigation} />
			<Stack.Screen name="Lesson" component={Lesson} />
		</Stack.Navigator>
	);
}
