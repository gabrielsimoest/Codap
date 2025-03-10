import {
	BottomTabBarButtonProps,
	createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { ComponentType, useEffect, useRef } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	ViewProps,
	ViewStyle,
} from "react-native";
import { View } from "react-native-animatable";
import Icon from "../components/Icon";
import { useTheme } from "@react-navigation/native";
import Classes from "../screens/classes/Classes";

const Tab = createBottomTabNavigator();

type IconType =
	| "materialCommunity"
	| "material"
	| "ionicon"
	| "feather"
	| "fontawesome"
	| "fontawesome5"
	| "antdesign"
	| "entypo"
	| "simpleLineIcons"
	| "octicons"
	| "foundation";

interface TabItem {
	route: string;
	label: string;
	type: IconType;
	activeIcon: string;
	inActiveIcon: string;
	component: ComponentType<any>;
}

/* Tabs */
const TabArr: TabItem[] = [
	{
		route: "Class",
		label: "Class",
		type: "ionicon",
		activeIcon: "grid",
		inActiveIcon: "grid-outline",
		component: Classes,
	},
	{
		route: "Class2",
		label: "Class",
		type: "ionicon",
		activeIcon: "grid",
		inActiveIcon: "grid-outline",
		component: Classes,
	},
	/*{
      route: 'Chat',
      label: 'Chat',
      type: Icons.MaterialCommunityIcons,
      activeIcon: 'chat',
      inActiveIcon: 'chat-outline',
      component: Config,
    },*/
	/*     {
        route: 'Store',
        label: 'Store',
        type: Icons.MaterialCommunityIcons,
        activeIcon: 'store-settings',
        inActiveIcon: 'store-settings-outline',
        component: Store,
    },
    {
        route: 'Account',
        label: 'Account',
        type: Icons.FontAwesome,
        activeIcon: 'user-circle',
        inActiveIcon: 'user-circle-o',
        component: Perfil,
    },
    {
        route: 'Settings',
        label: 'Settings',
        type: Icons.Ionicons,
        activeIcon: 'settings',
        inActiveIcon: 'settings-outline',
        component: Config,
    }, */
];

type TabButtonProps = { item: TabItem } & BottomTabBarButtonProps;

//Tab button
const TabButton = (props: TabButtonProps) => {
	const { item, onPress, accessibilityState } = props;
	const focused = accessibilityState?.selected;
	const viewRef = useRef<View>(null);

	useEffect(() => {
		if (viewRef.current) {
			if (focused) {
				viewRef.current.animate({
					/* 0: { scale: 0.5, rotate: "0deg" },
					1: { scale: 1.5, rotate: "360deg" }, */
					0: { transform: [{ scale: 0.5 }, { rotate: "0deg" }] },
					1: { transform: [{ scale: 1.5 }, { rotate: "360deg" }] },
				});
			} else {
				viewRef.current.animate({
					/* 0: { scale: 1.5, rotate: "360deg" },
					1: { scale: 1, rotate: "0deg" }, */
					0: { transform: [{ scale: 1.5 }, { rotate: "360deg" }] },
					1: { transform: [{ scale: 1 }, { rotate: "0deg" }] },
				});
			}
		}
	}, [focused]);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={1}
			style={styles.container}
		>
			<View ref={viewRef} duration={1000} style={styles.container}>
				<Icon
					type={item.type}
					name={focused ? item.activeIcon : item.inActiveIcon}
					color={focused ? "#637aff" : "#637aff99"}
				/>
			</View>
		</TouchableOpacity>
	);
};

export function TabNavigation() {
	const { colors } = useTheme();

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarHideOnKeyboard: false,
				tabBarStyle: {
					width: "90%",
					marginLeft: "5%",
					marginRight: "5%",
					height: 60,
					position: "absolute",
					bottom: 16,
					borderRadius: 16,
					backgroundColor: colors.background,
				},
			}}
		>
			{TabArr.map((item, index) => {
				return (
					<Tab.Screen
						key={index}
						name={item.route}
						component={item.component}
						options={{
							tabBarShowLabel: false,
							tabBarButton: (props: BottomTabBarButtonProps) => (
								<TabButton {...props} item={item} />
							),
						}}
					/>
				);
			})}
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
