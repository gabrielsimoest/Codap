import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import React from 'react';

import Login from './src/Login/Login';
import Register from './src/Login/Register';
import Home from './src/Aulas/Home';
//import List from './src/Listadmin';
import Config from './src/Config/Config';
import Perfil from './src/Users/Perfil';
import Header from './src/Shared/header';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
          bottom: 20,
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
        name="Configuração"
        component={Config}
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
