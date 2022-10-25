import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, cardStyleInterpolator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon, {Icons} from './components/Icons';
import Colors from './constants/Colors';
import * as Animatable from 'react-native-animatable';

import Login from './Login/Login';
import Register from './Login/Register';
//import List from './src/Listadmin';
import Config from './Config/Config';
import CongratsView from './Helpers/CongratsView';
import Perfil from './Users/Perfil';
import Store from './Market/Store';
import Class from './Aulas/Class';
import OptionView from './Helpers/OptionView';
//import Testes from './Teste';
import Testes2 from './Teste2';
import { Basic1_html, Basic2_html, Basic3_html, BasicPrat1_html, BasicPrat2_html, BasicPrat3_html, BasicPrat4_html} from './Aulas/ClassContent/Html/Basic_html';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


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
          backgroundColor: '#141f29'
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

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

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
          name="Home"
          component={HomeTabs}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name="Css"
          component={Class}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Basic1_html'
          component={Basic1_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Basic2_html'
          component={Basic2_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Basic3_html'
          component={Basic3_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Teste2'
          component={Testes2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BasicPrat1_html'
          component={BasicPrat1_html}
          options={{ cardStyleInterpolator: forFade }}
          
        />
        <Stack.Screen
          name='OptionView'
          component={OptionView}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BasicPrat2_html'
          component={BasicPrat2_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BasicPrat3_html'
          component={BasicPrat3_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BasicPrat4_html'
          component={BasicPrat4_html}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='CongratsView'
          component={CongratsView}
          options={{ cardStyleInterpolator: forFade }}
        />
        

      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App;
