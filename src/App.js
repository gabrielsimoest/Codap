import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon, {Icons} from './components/Icons';
import Colors from './constants/Colors';
import * as Animatable from 'react-native-animatable';

import Login from './Login/Login';
import Register from './Login/Register';
import Home from './Aulas/Home';
//import List from './src/Listadmin';
import Config from './Config/Config';
import Perfil from './Users/Perfil';
import Header from './Shared/header';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const TabArr = [
  {
    route: 'Home',
    label: 'Home',
    type: Icons.Ionicons,
    activeIcon: 'grid',
    inActiveIcon: 'grid-outline',
    component: Home,
  },
  {
    route: 'Like',
    label: 'Like',
    type: Icons.MaterialCommunityIcons,
    activeIcon: 'chat',
    inActiveIcon: 'chat-outline',
    component: Config,
  },
  {
    route: 'Search',
    label: 'Search',
    type: Icons.MaterialCommunityIcons,
    activeIcon: 'store-settings',
    inActiveIcon: 'store-settings-outline',
    component: Header,
  },
  {
    route: 'Account',
    label: 'Account',
    type: Icons.FontAwesome,
    activeIcon: 'user-circle',
    inActiveIcon: 'user-circle-o',
    component: Perfil,
  },
];

const TabButton = props => {
  const {item, onPress, accessibilityState} = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({
        0: {scale: 0.5, rotate: '0deg'},
        1: {scale: 1.5, rotate: '360deg'},
      });
    } else {
      viewRef.current.animate({
        0: {scale: 1.5, rotate: '360deg'},
        1: {scale: 1, rotate: '0deg'},
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

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          position: 'absolute',
          bottom: 16,
          right: 16,
          left: 16,
          borderRadius: 16,
          backgroundColor: '#141f20'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});










/*
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7977FD',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#141f25',
        tabBarInactiveBackgroundColor: '#141f25',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 13,
          display: 'none',
        },
        tabBarStyle: { 
          position: 'absolute',
          overflow: 'hidden',
          bottom: 70,
          left: 30,
          right: 30,
          elevation: 0,
          height: 50,
          borderRadius: 15,
        },
      }}
      initialRouteName="Aulas"
      backBehavior='initialRoute'
    >
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{
          header: () => null,
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons style={{marginTop: 4}} name="account-circle-outline" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Aulas"
        component={Home}
        options={{
          headerTitle: () => <Header/>,
          tabBarLabel: 'Aulas',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="code-tags" color={color} size={50} />
          ),
        }}
      />
      <Tab.Screen
        name="AnimTab1"
        component={AnimTab1}
        options={{
          header: () => null,
          tabBarLabel: 'Configuração',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons style={{marginTop: 4}} name="cog" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

*/

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: () => null
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Register"
          component={Register}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
        />

      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App;
