import { NavigationContainer, DefaultTheme, useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon, { Icons } from './components/Icons';
import Colors from './constants/Colors';
import * as Animatable from 'react-native-animatable';
import { useSelector } from 'react-redux';
import './ReduxRoot/Store/configureStore';

import Login from './Login/Login';
import Register from './Login/Register';
//import List from './src/Listadmin';
import Config from './Config/Config';
import CongratsView from './Helpers/CongratsView';
import OptionView from './Helpers/OptionView';
import SorryView from './Helpers/SorryView';
import Perfil from './Users/Perfil';
import Store from './Market/Store';
import Class from './Aulas/Class';
//AULAS
import { Estrutura, HtmlStartEx1, HtmlStartEx2, HtmlStartEx3, HtmlStartEx4, HtmlStartEx5,TagsElements } from './Aulas/ClassContent/Html/DescobrindoHTML_Tags';
import { H1h6, HeaderEx1, HeaderEx2, HeaderEx3, HeaderEx4, HeaderEx5, HeaderEx6 } from './Aulas/ClassContent/Html/EstrutandoTitulos';
import { P, FraseEx1, FraseEx2, FraseEx3, FraseEx4, FraseEx5, FraseEx6 } from './Aulas/ClassContent/Html/CriandoFrases';
import { ButtonHtml, ButtonEx1, ButtonEx2, ButtonEx3, ButtonEx4, ButtonEx5, ButtonEx6} from './Aulas/ClassContent/Html/ConstruindoBotões';
import { BasicPrat1_html, BasicPrat2_html, BasicPrat3_html, BasicPrat4_html } from './Aulas/ClassContent/Html/Basic_html';
import { Basic1_html, Basic2_html, Basic3_html, } from './Aulas/ClassContent/Html/Text';

//Ignorar Warning Do navigator no Timer
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: Cannot update a component (`ForwardRef(BaseNavigationContainer)`)']);

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
function HomeTabs() {
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
          backgroundColor: colors.background
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

//Componente style do botton tab
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

//Animação stack navigation
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

/* vvv Gerenciamento dos temas vvv */

//Dark mode
const CustomDarkMode = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    //Definir as cores
    background: "#141f29",
    text: "#F1F1F1",
    primary: "#1B2B39",
    card: '#0E151C',
    border: "#233648",
    notification: "#33526E",
  }
}

//Light mode
const CustomLightMode = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    //Definir as cores
    background: "#FFFF",
    text: "#000",
    primary: "#F1F1F1",
    card: '#DEDFE1',
    border: "#E5E5E5",
    notification: "#F5F5F5"
  }
}

/* ^^^ Gerenciamento dos temas ^^^ */

//APP
function App() {

  //Variavel para seleção de tema
  let currentTheme = useSelector(state => {
    return state.myDarkMode
  })

  return (
    <NavigationContainer theme={currentTheme ? CustomDarkMode : CustomLightMode}>
      <Stack.Navigator
        screenOptions={{
          header: () => null
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeTabs}
        />
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Register"
          component={Register}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
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
          name="SorryView"
          component={SorryView}
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
        <Stack.Screen
          name='Estrutura'
          component={Estrutura}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='TagsElementos'
          component={TagsElements}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HtmlStartEx1'
          component={HtmlStartEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HtmlStartEx2'
          component={HtmlStartEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HtmlStartEx3'
          component={HtmlStartEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HtmlStartEx4'
          component={HtmlStartEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HtmlStartEx5'
          component={HtmlStartEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Header'
          component={H1h6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx1'
          component={HeaderEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx2'
          component={HeaderEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx3'
          component={HeaderEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx4'
          component={HeaderEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx5'
          component={HeaderEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeaderEx6'
          component={HeaderEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Frases'
          component={P}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx1'
          component={FraseEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx2'
          component={FraseEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx3'
          component={FraseEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx4'
          component={FraseEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx5'
          component={FraseEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='FraseEx6'
          component={FraseEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonHtml'
          component={ButtonHtml}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx1'
          component={ButtonEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx2'
          component={ButtonEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx3'
          component={ButtonEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx4'
          component={ButtonEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx5'
          component={ButtonEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ButtonEx6'
          component={ButtonEx6}
          options={{ cardStyleInterpolator: forFade }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App;
