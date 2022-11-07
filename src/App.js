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
//COMPONENTES
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
import { ImgTeoric, Img1, Img2, Img3, Img4, Img5, Img6 } from './Aulas/ClassContent/Html/AdicionandoImagens';
import { Comentario, ComentarioEx1, ComentarioEx2, ComentarioEx3, ComentarioEx4, ComentarioEx5, ComentarioEx6 } from './Aulas/ClassContent/Html/CriandoComentarios';
import { Head, HeadEx1, HeadEx2, HeadEx3, HeadEx4, HeadEx5, HeadEx6 } from './Aulas/ClassContent/Html/Head';
import { Body, BodyEx1, BodyEx2, BodyEx3, BodyEx4, BodyEx5, BodyEx6 } from './Aulas/ClassContent/Html/DefinindoBody';
import { Listas, ListaEx1,  ListaEx2, ListaEx3, ListaEx4, ListaEx5, ListaEx6 } from './Aulas/ClassContent/Html/CriandoListas';
import { Links, LinksEx1,  LinksEx2, LinksEx3, LinksEx4, LinksEx5, LinksEx6 } from './Aulas/ClassContent/Html/CriandoLinks';
import { Div, DivEx1, DivEx2, LineBreak, LineBreakEx1, LineBreakEx2, LineBreakEx3 } from './Aulas/ClassContent/Html/DivLinhaEspaço';
import { IndentTeoric, Indent1, Indent2, Indent3, Indent4, Indent5, Indent6 } from './Aulas/ClassContent/Html/Avancado/IdentificandoElementos';
import { ITableTeoric, ITable1, ITable2, ITable3, ITable4, ITable5} from './Aulas/ClassContent/Html/Avancado/IntroducaoaTabelas';

//TESTES
import { BasicPrat1_html, BasicPrat2_html, BasicPrat3_html, BasicPrat4_html } from './Aulas/ClassContent/Html/Basic_html';
import { Basic1_html, Basic2_html, Basic3_html, } from './Aulas/ClassContent/Html/Text';

//Ignorar Warning Do navigator no Timer
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: Cannot update a component (`ForwardRef(BaseNavigationContainer)`)']);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
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
        <Stack.Screen
          name='ImgTeoric'
          component={ImgTeoric}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img1'
          component={Img1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img2'
          component={Img2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img3'
          component={Img3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img4'
          component={Img4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img5'
          component={Img5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Img6'
          component={Img6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Comentario'
          component={Comentario}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx1'
          component={ComentarioEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx2'
          component={ComentarioEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx3'
          component={ComentarioEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx4'
          component={ComentarioEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx5'
          component={ComentarioEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ComentarioEx6'
          component={ComentarioEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Head'
          component={Head}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx1'
          component={HeadEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx2'
          component={HeadEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx3'
          component={HeadEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx4'
          component={HeadEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx5'
          component={HeadEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='HeadEx6'
          component={HeadEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Body'
          component={Body}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx1'
          component={BodyEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx2'
          component={BodyEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx3'
          component={BodyEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx4'
          component={BodyEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx5'
          component={BodyEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='BodyEx6'
          component={BodyEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Listas'
          component={Listas}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx1'
          component={ListaEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx2'
          component={ListaEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx3'
          component={ListaEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx4'
          component={ListaEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx5'
          component={ListaEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ListaEx6'
          component={ListaEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Links'
          component={Links}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx1'
          component={LinksEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx2'
          component={LinksEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx3'
          component={LinksEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx4'
          component={LinksEx4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx5'
          component={LinksEx5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LinksEx6'
          component={LinksEx6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Div'
          component={Div}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='DivEx1'
          component={DivEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='DivEx2'
          component={DivEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LineBreak'
          component={LineBreak}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LineBreakEx1'
          component={LineBreakEx1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LineBreakEx2'
          component={LineBreakEx2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='LineBreakEx3'
          component={LineBreakEx3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='IndentTeoric'
          component={IndentTeoric}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent1'
          component={Indent1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent2'
          component={Indent2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent3'
          component={Indent3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent4'
          component={Indent4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent5'
          component={Indent5}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='Indent6'
          component={Indent6}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITableTeoric'
          component={ITableTeoric}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITable1'
          component={ITable1}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITable2'
          component={ITable2}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITable3'
          component={ITable3}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITable4'
          component={ITable4}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen
          name='ITable5'
          component={ITable5}
          options={{ cardStyleInterpolator: forFade }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App;
