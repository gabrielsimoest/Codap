import React, { useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import Colors from '../../constants/Colors';
import * as Animatable from 'react-native-animatable';
//COMPONENTES
import Config from '../../Config/Config';
import Store from '../../Market/Store';
import Class from '../../Aulas/Class';
import Perfil from '../../Users/Perfil';

const Tab = createBottomTabNavigator();

//Componente style do botton tab
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

//TAB ARRAY
const TabArr = [
    {
        route: 'Class',
        label: 'Class',
        type: Icons.Ionicons,
        activeIcon: 'grid',
        inActiveIcon: 'grid-outline',
        component: Class,
    },
    /*{
      route: 'Chat',
      label: 'Chat',
      type: Icons.MaterialCommunityIcons,
      activeIcon: 'chat',
      inActiveIcon: 'chat-outline',
      component: Config,
    },*/
    {
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
    },
];

//Botões
const TabButton = props => {
    const { item, onPress, accessibilityState } = props;
    const focused = accessibilityState.selected;
    const viewRef = useRef(null);

    useEffect(() => {
        if (focused) {
            viewRef.current.animate({
                0: { scale: 0.5, rotate: '0deg' },
                1: { scale: 1.5, rotate: '360deg' },
            });
        } else {
            viewRef.current.animate({
                0: { scale: 1.5, rotate: '360deg' },
                1: { scale: 1, rotate: '0deg' },
            });
        }
    }, [focused]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={1}
            style={styles.container}>
            <Animatable.View ref={viewRef} duration={1000} style={styles.container}>
                <Icon
                    type={item.type}
                    name={focused ? item.activeIcon : item.inActiveIcon}
                    color={focused ? Colors.primary : Colors.primaryLite}
                />
            </Animatable.View>
        </TouchableOpacity>
    );
};

//Função bottom tab
export function TabNavigator() {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: false,
                tabBarStyle: {
                    height: 60,
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    left: 16,
                    borderRadius: 16,
                    backgroundColor: colors.background,
                },
            }}>
            {TabArr.map((item, index) => {
                return (
                    <Tab.Screen
                        key={index}
                        name={item.route}
                        component={item.component}
                        options={{
                            tabBarShowLabel: false,
                            tabBarButton: props => <TabButton {...props} item={item} />,
                        }}
                    />
                );
            })}
        </Tab.Navigator>
    );
}
