import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import React from 'react';

import Login from './src/Login';
import Register from './src/Register';
import Home from './src/Home';
import List from './src/Listadmin';
import Config from './src/Config';
import Perfil from './src/Perfil';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => null,
        tabBarActiveTintColor: '#7977FD',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#1D1D1D',
        tabBarInactiveBackgroundColor: '#1D1D1D',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 15,
        },
        tabBarStyle: { position: 'absolute', height: '9%' },
      }}
      initialRouteName="Aulas"
      backBehavior='initialRoute'
    >
      <Tab.Screen name="Perfil" component={Perfil} />
      <Tab.Screen name="Aulas" component={Home} />
      <Tab.Screen name="Configuração" component={Config} />
    </Tab.Navigator>
  )
}

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
