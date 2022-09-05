import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import Login from './src/Login';
import Register from './src/Register';
import Home from './src/Home';
import List from './src/Listadmin'

const Stack = createStackNavigator();

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
        component={Home}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;
