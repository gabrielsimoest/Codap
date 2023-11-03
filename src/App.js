import {
  NavigationContainer,
  DefaultTheme,
  useTheme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useEffect, useRef} from 'react';
import {Platform, StyleSheet, TouchableOpacity} from 'react-native';
import Icon, {Icons} from './components/Icons';
import Colors from './constants/Colors';
import * as Animatable from 'react-native-animatable';
import {useSelector, useDispatch} from 'react-redux';
import './ReduxRoot/Store/configureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
//AULAS HTML
import {
  Estrutura,
  HtmlStartEx1,
  HtmlStartEx2,
  HtmlStartEx3,
  HtmlStartEx4,
  HtmlStartEx5,
  TagsElements,
} from './Aulas/ClassContent/Html/1.Basico/DescobrindoHTML_Tags';
import {
  H1h6,
  HeaderEx1,
  HeaderEx2,
  HeaderEx3,
  HeaderEx4,
  HeaderEx5,
  HeaderEx6,
} from './Aulas/ClassContent/Html/1.Basico/EstrutandoTitulos';
import {
  P,
  FraseEx1,
  FraseEx2,
  FraseEx3,
  FraseEx4,
  FraseEx5,
  FraseEx6,
} from './Aulas/ClassContent/Html/1.Basico/CriandoFrases';
import {
  ButtonHtml,
  ButtonEx1,
  ButtonEx2,
  ButtonEx3,
  ButtonEx4,
  ButtonEx5,
  ButtonEx6,
} from './Aulas/ClassContent/Html/1.Basico/ConstruindoBotões';
import {
  ImgTeoric,
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from './Aulas/ClassContent/Html/1.Basico/AdicionandoImagens';
import {
  Comentario,
  ComentarioEx1,
  ComentarioEx2,
  ComentarioEx3,
  ComentarioEx4,
  ComentarioEx5,
  ComentarioEx6,
} from './Aulas/ClassContent/Html/1.Basico/CriandoComentarios';
import {
  Head,
  HeadEx1,
  HeadEx2,
  HeadEx3,
  HeadEx4,
  HeadEx5,
  HeadEx6,
} from './Aulas/ClassContent/Html/Head';
import {
  Body,
  BodyEx1,
  BodyEx2,
  BodyEx3,
  BodyEx4,
  BodyEx5,
  BodyEx6,
} from './Aulas/ClassContent/Html/DefinindoBody';
import {
  Listas,
  ListaEx1,
  ListaEx2,
  ListaEx3,
  ListaEx4,
  ListaEx5,
  ListaEx6,
} from './Aulas/ClassContent/Html/2.Intermediario/CriandoListas';
import {
  Links,
  LinksEx1,
  LinksEx2,
  LinksEx3,
  LinksEx4,
  LinksEx5,
  LinksEx6,
} from './Aulas/ClassContent/Html/CriandoLinks';
import {
  Div,
  DivEx1,
  DivEx2,
  LineBreak,
  LineBreakEx1,
  LineBreakEx2,
  LineBreakEx3,
} from './Aulas/ClassContent/Html/DivLinhaEspaço';
import {
  IndentTeoric,
  Indent1,
  Indent2,
  Indent3,
  Indent4,
  Indent5,
  Indent6,
} from './Aulas/ClassContent/Html/Avancado/IdentificandoElementos';
import {
  ITableTeoric,
  ITable1,
  ITable2,
  ITable3,
  ITable4,
  ITable5,
} from './Aulas/ClassContent/Html/Avancado/IntroducaoaTabelas';
import {
  CriandoDados,
  CriandoDados2,
  CriandoDados3,
  CriandoDados4,
  CriandoDados5,
} from './Aulas/ClassContent/Html/Avancado/CriandoDados';
import {
  AdicionandoLinhas,
  AdicionandoLinhas2,
  AdicionandoLinhas3,
  AdicionandoLinhas4,
  AdicionandoLinhas5,
  AdicionandoLinhas6,
} from './Aulas/ClassContent/Html/Avancado/AdicionandoLinhas';
import {
  AdicionandoDados,
  AdicionandoDados2,
  AdicionandoDados3,
  AdicionandoDados4,
  AdicionandoDados5,
  AdicionandoDados6,
} from './Aulas/ClassContent/Html/Maestria/AdicionandoDados';
import {
  TiposDeDados,
  TiposDeDados2,
  TiposDeDados3,
  TiposDeDados4,
  TiposDeDados5,
} from './Aulas/ClassContent/Html/Maestria/TiposDeDados';
import {
  SelecionandoDados,
  SelecionandoDados2,
  SelecionandoDados3,
  SelecionandoDados4,
  SelecionandoDados5,
  SelecionandoDados6,
} from './Aulas/ClassContent/Html/Maestria/SelecionandoDados';
import {
  MostrandoVideos,
  MostrandoVideos2,
  MostrandoVideos3,
  MostrandoVideos4,
  MostrandoVideos5,
} from './Aulas/ClassContent/Html/Maestria/MostrandoVideos';

//AULAS JS
import {
  ConhecendoJS,
  JSEx1,
  JSEx2,
  JSEx3,
  JSEx4,
  JSEx5,
} from './Aulas/ClassContent/JavaScript/1.Basico/ConhecendoJS';
import {
  Variaveis,
  VariaveisEx1,
  VariaveisEx2,
  VariaveisEx3,
  VariaveisEx4,
  VariaveisEx5,
} from './Aulas/ClassContent/JavaScript/1.Basico/Variaveis';
import {
  TiposDados,
  TiposDadosEx2,
  TiposDadosEx3,
  TiposDadosEx4,
  TiposDados2,
  TiposDadosEx1,
} from './Aulas/ClassContent/JavaScript/1.Basico/TiposDados';
import {
  Interações,
  InteraçõesEx1,
  InteraçõesEx2,
  InteraçõesEx3,
  InteraçõesEx4,
  InteraçõesEx5,
} from './Aulas/ClassContent/JavaScript/1.Basico/AdicionandoInterações';
import {
  ConvertendoTipos,
  ConvertendoTiposEx1,
  ConvertendoTiposEx2,
  ConvertendoTiposEx3,
  ConvertendoTiposEx4,
  ConvertendoTiposEx5,
} from './Aulas/ClassContent/JavaScript/1.Basico/ConvertendoTipos';
import {
  Operadores,
  OperadoresEx1,
  OperadoresEx2,
  OperadoresEx3,
  OperadoresEx4,
  OperadoresEx5,
  OperadoresEx6,
  OperadoresEx7,
} from './Aulas/ClassContent/JavaScript/2.Intermediário/CalculosOperadores';
import {
  Comparação,
  ComparaçãoEx1,
  ComparaçãoEx2,
  ComparaçãoEx3,
  ComparaçãoEx4,
  ComparaçãoEx5,
} from './Aulas/ClassContent/JavaScript/2.Intermediário/Comparações';
import {
  IfElse,
  IfElseEx1,
  IfElseEx2,
  IfElseEx3,
  IfElseEx4,
  IfElseEx5,
  OperadorTernario,
  OperadorTernarioEx1,
} from './Aulas/ClassContent/JavaScript/2.Intermediário/OperadoresLogicos';
import {
  WhileFor,
  WhileForEx1,
  WhileForEx2,
  WhileForEx3,
  WhileForEx4,
  WhileForEx5,
} from './Aulas/ClassContent/JavaScript/2.Intermediário/Laços';

//AULAS CSS

import {
  AdicionandoBordas,
  AdicionandoBordas2,
  AdicionandoBordas3,
  AdicionandoBordas4,
  AdicionandoBordas5,
  AdicionandoBordas6,
  AdicionandoBordas7,
} from './Aulas/ClassContent/CSS/2.Intermediario/AdicionandoBordas';
import {
  ColocandoMargin,
  ColocandoMargin2,
  ColocandoMargin3,
  ColocandoMargin4,
  ColocandoMargin5,
  ColocandoMargin6,
} from './Aulas/ClassContent/CSS/2.Intermediario/ColocandoMargin';
import {
  AdicionandoPadding,
  AdicionandoPadding2,
  AdicionandoPadding3,
  AdicionandoPadding4,
  AdicionandoPadding5,
  AdicionandoPadding6,
} from './Aulas/ClassContent/CSS/2.Intermediario/AdicionandoPadding';
import {
  ConhecendoCSS,
  CSSEx1,
  CSSEx2,
  CSSEx3,
} from './Aulas/ClassContent/CSS/1.Basico/ConhecendoCss';
import {
  ColorCSS,
  ColorEx1,
  ColorEx2,
  ColorEx3,
} from './Aulas/ClassContent/CSS/1.Basico/ColorCSS';
import {
  BackgroungColorCSS,
  BackgroungColorEx1,
  BackgroungColorEx2,
} from './Aulas/ClassContent/CSS/1.Basico/BackgroundColorCSS';
import {
  FontSizeCSS,
  FontSizeEx1,
  FontSizeEx2,
} from './Aulas/ClassContent/CSS/1.Basico/FontSizeCSS';
import {
  FontFamilyCSS,
  FontFamilyEx1,
  FontFamilyEx2,
} from './Aulas/ClassContent/CSS/1.Basico/FontFamily';

//TESTES
import {
  BasicPrat1_html,
  BasicPrat2_html,
  BasicPrat3_html,
  BasicPrat4_html,
} from './Aulas/ClassContent/Html/Basic_html';
import {
  Basic1_html,
  Basic2_html,
  Basic3_html,
} from './Aulas/ClassContent/Html/Text';

//Ignorar Warning Do navigator no Timer
import {LogBox} from 'react-native';
LogBox.ignoreLogs([
  'Warning: Cannot update a component (`ForwardRef(BaseNavigationContainer)`)',
]);

import SplashScreen from 'react-native-splash-screen';

///////////////////////////////////
import TesteCode from './TesteCode';
import TheoryView from './Helpers/TheoryView';
import TestCarousel from './TestCarousel';
import { use } from 'i18next';
import { useTranslation } from 'react-i18next';
///////////////////////////////////

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

//Função bottom tab
function HomeTabs() {
  const {colors} = useTheme();

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

//Componente style do botton tab
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

//Animação stack navigation
const forFade = ({current}) => ({
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
    background: '#141f29',
    text: '#F1F1F1',
    primary: '#1B2B39',
    card: '#0E151C',
    border: '#233648',
    notification: '#33526E',
  },
};

//Light mode
const CustomLightMode = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    //Definir as cores
    background: '#FFFF',
    text: '#000',
    primary: '#F1F1F1',
    card: '#DEDFE1',
    border: '#E5E5E5',
    notification: '#F5F5F5',
  },
};

/* ^^^ Gerenciamento dos temas ^^^ */

//APP
function App() {
  //Variavel para seleção de tema
  let currentTheme = useSelector(state => {
    return state.myDarkMode;
  });

  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();

  React.useEffect(() => {
    //Aplicar tema
    AsyncStorage.getItem('@theme_key')
      .then(value => {
        if (value !== null) {
          dispatch({ type: "change_theme", payload: value === 'true' });
        }
      })
      .catch(error => {
        console.error('Error retrieving theme state:', error);
      });
      //Aplicar idioma
      AsyncStorage.getItem('@language_key')
        .then(value => {
            if (value !== null) {
                i18n.changeLanguage(value);
            }
        })
        .catch(error => {
            console.error('Error retrieving language:', error);
        });
  }, []);

  useEffect (() => {
    if(Platform.OS === 'android') SplashScreen.hide();
  }, [])

  return (
    <NavigationContainer
      theme={currentTheme ? CustomDarkMode : CustomLightMode}>
      <Stack.Navigator
        screenOptions={{
          header: () => null,
        }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen
          name="Css"
          component={Class}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Basic1_html"
          component={Basic1_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Basic2_html"
          component={Basic2_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Basic3_html"
          component={Basic3_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BasicPrat1_html"
          component={BasicPrat1_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OptionView"
          component={OptionView}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen name="SorryView" component={SorryView} />
        <Stack.Screen
          name="BasicPrat2_html"
          component={BasicPrat2_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BasicPrat3_html"
          component={BasicPrat3_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BasicPrat4_html"
          component={BasicPrat4_html}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CongratsView"
          component={CongratsView}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Estrutura"
          component={Estrutura}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TagsElementos"
          component={TagsElements}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HtmlStartEx1"
          component={HtmlStartEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HtmlStartEx2"
          component={HtmlStartEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HtmlStartEx3"
          component={HtmlStartEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HtmlStartEx4"
          component={HtmlStartEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HtmlStartEx5"
          component={HtmlStartEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Header"
          component={H1h6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx1"
          component={HeaderEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx2"
          component={HeaderEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx3"
          component={HeaderEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx4"
          component={HeaderEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx5"
          component={HeaderEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeaderEx6"
          component={HeaderEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Frases"
          component={P}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx1"
          component={FraseEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx2"
          component={FraseEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx3"
          component={FraseEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx4"
          component={FraseEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx5"
          component={FraseEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FraseEx6"
          component={FraseEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonHtml"
          component={ButtonHtml}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx1"
          component={ButtonEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx2"
          component={ButtonEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx3"
          component={ButtonEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx4"
          component={ButtonEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx5"
          component={ButtonEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ButtonEx6"
          component={ButtonEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ImgTeoric"
          component={ImgTeoric}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img1"
          component={Img1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img2"
          component={Img2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img3"
          component={Img3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img4"
          component={Img4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img5"
          component={Img5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Img6"
          component={Img6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Comentario"
          component={Comentario}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx1"
          component={ComentarioEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx2"
          component={ComentarioEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx3"
          component={ComentarioEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx4"
          component={ComentarioEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx5"
          component={ComentarioEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComentarioEx6"
          component={ComentarioEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Head"
          component={Head}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx1"
          component={HeadEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx2"
          component={HeadEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx3"
          component={HeadEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx4"
          component={HeadEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx5"
          component={HeadEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="HeadEx6"
          component={HeadEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Body"
          component={Body}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx1"
          component={BodyEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx2"
          component={BodyEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx3"
          component={BodyEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx4"
          component={BodyEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx5"
          component={BodyEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BodyEx6"
          component={BodyEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Listas"
          component={Listas}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx1"
          component={ListaEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx2"
          component={ListaEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx3"
          component={ListaEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx4"
          component={ListaEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx5"
          component={ListaEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ListaEx6"
          component={ListaEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Links"
          component={Links}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx1"
          component={LinksEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx2"
          component={LinksEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx3"
          component={LinksEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx4"
          component={LinksEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx5"
          component={LinksEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LinksEx6"
          component={LinksEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Div"
          component={Div}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="DivEx1"
          component={DivEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="DivEx2"
          component={DivEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LineBreak"
          component={LineBreak}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LineBreakEx1"
          component={LineBreakEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LineBreakEx2"
          component={LineBreakEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="LineBreakEx3"
          component={LineBreakEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IndentTeoric"
          component={IndentTeoric}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent1"
          component={Indent1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent2"
          component={Indent2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent3"
          component={Indent3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent4"
          component={Indent4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent5"
          component={Indent5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Indent6"
          component={Indent6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITableTeoric"
          component={ITableTeoric}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITable1"
          component={ITable1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITable2"
          component={ITable2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITable3"
          component={ITable3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITable4"
          component={ITable4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ITable5"
          component={ITable5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConhecendoJS"
          component={ConhecendoJS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="JSEx1"
          component={JSEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="JSEx2"
          component={JSEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="JSEx3"
          component={JSEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="JSEx4"
          component={JSEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="JSEx5"
          component={JSEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Variaveis"
          component={Variaveis}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="VariaveisEx1"
          component={VariaveisEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="VariaveisEx2"
          component={VariaveisEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="VariaveisEx3"
          component={VariaveisEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="VariaveisEx4"
          component={VariaveisEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="VariaveisEx5"
          component={VariaveisEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDados"
          component={TiposDados}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDadosEx1"
          component={TiposDadosEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDadosEx2"
          component={TiposDadosEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDadosEx3"
          component={TiposDadosEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDadosEx4"
          component={TiposDadosEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDados2"
          component={TiposDados2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Interações"
          component={Interações}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="InteraçõesEx1"
          component={InteraçõesEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="InteraçõesEx2"
          component={InteraçõesEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="InteraçõesEx3"
          component={InteraçõesEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="InteraçõesEx4"
          component={InteraçõesEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="InteraçõesEx5"
          component={InteraçõesEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTipos"
          component={ConvertendoTipos}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTiposEx1"
          component={ConvertendoTiposEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTiposEx2"
          component={ConvertendoTiposEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTiposEx3"
          component={ConvertendoTiposEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTiposEx4"
          component={ConvertendoTiposEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConvertendoTiposEx5"
          component={ConvertendoTiposEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Operadores"
          component={Operadores}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx1"
          component={OperadoresEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx2"
          component={OperadoresEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx3"
          component={OperadoresEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx4"
          component={OperadoresEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx5"
          component={OperadoresEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx6"
          component={OperadoresEx6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadoresEx7"
          component={OperadoresEx7}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="Comparação"
          component={Comparação}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComparaçãoEx1"
          component={ComparaçãoEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComparaçãoEx2"
          component={ComparaçãoEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComparaçãoEx3"
          component={ComparaçãoEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComparaçãoEx4"
          component={ComparaçãoEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ComparaçãoEx5"
          component={ComparaçãoEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElse"
          component={IfElse}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElseEx1"
          component={IfElseEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElseEx2"
          component={IfElseEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElseEx3"
          component={IfElseEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElseEx4"
          component={IfElseEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="IfElseEx5"
          component={IfElseEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadorTernario"
          component={OperadorTernario}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="OperadorTernarioEx1"
          component={OperadorTernarioEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileFor"
          component={WhileFor}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileForEx1"
          component={WhileForEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileForEx2"
          component={WhileForEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileForEx3"
          component={WhileForEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileForEx4"
          component={WhileForEx4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="WhileForEx5"
          component={WhileForEx5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CriandoDados"
          component={CriandoDados}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CriandoDados2"
          component={CriandoDados2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CriandoDados3"
          component={CriandoDados3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CriandoDados4"
          component={CriandoDados4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CriandoDados5"
          component={CriandoDados5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas"
          component={AdicionandoLinhas}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas2"
          component={AdicionandoLinhas2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas3"
          component={AdicionandoLinhas3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas4"
          component={AdicionandoLinhas4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas5"
          component={AdicionandoLinhas5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoLinhas6"
          component={AdicionandoLinhas6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados"
          component={AdicionandoDados}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados2"
          component={AdicionandoDados2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados3"
          component={AdicionandoDados3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados4"
          component={AdicionandoDados4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados5"
          component={AdicionandoDados5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoDados6"
          component={AdicionandoDados6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDeDados"
          component={TiposDeDados}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDeDados2"
          component={TiposDeDados2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDeDados3"
          component={TiposDeDados3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDeDados4"
          component={TiposDeDados4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TiposDeDados5"
          component={TiposDeDados5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados"
          component={SelecionandoDados}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados2"
          component={SelecionandoDados2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados3"
          component={SelecionandoDados3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados4"
          component={SelecionandoDados4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados5"
          component={SelecionandoDados5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="SelecionandoDados6"
          component={SelecionandoDados6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="MostrandoVideos"
          component={MostrandoVideos}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="MostrandoVideos2"
          component={MostrandoVideos2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="MostrandoVideos3"
          component={MostrandoVideos3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="MostrandoVideos4"
          component={MostrandoVideos4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="MostrandoVideos5"
          component={MostrandoVideos5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas"
          component={AdicionandoBordas}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas2"
          component={AdicionandoBordas2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas3"
          component={AdicionandoBordas3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas4"
          component={AdicionandoBordas4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas5"
          component={AdicionandoBordas5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas6"
          component={AdicionandoBordas6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoBordas7"
          component={AdicionandoBordas7}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin"
          component={ColocandoMargin}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin2"
          component={ColocandoMargin2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin3"
          component={ColocandoMargin3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin4"
          component={ColocandoMargin4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin5"
          component={ColocandoMargin5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColocandoMargin6"
          component={ColocandoMargin6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding"
          component={AdicionandoPadding}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding2"
          component={AdicionandoPadding2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding3"
          component={AdicionandoPadding3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding4"
          component={AdicionandoPadding4}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding5"
          component={AdicionandoPadding5}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="AdicionandoPadding6"
          component={AdicionandoPadding6}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ConhecendoCSS"
          component={ConhecendoCSS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CSSEx1"
          component={CSSEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CSSEx2"
          component={CSSEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="CSSEx3"
          component={CSSEx3}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColorCSS"
          component={ColorCSS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColorEx1"
          component={ColorEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="ColorEx2"
          component={ColorEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BackgroundColorCSS"
          component={BackgroungColorCSS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BackgroungColorEx1"
          component={BackgroungColorEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="BackgroungColorEx2"
          component={BackgroungColorEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontSizeCSS"
          component={FontSizeCSS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontSizeEx1"
          component={FontSizeEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontSizeEx2"
          component={FontSizeEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontFamilyCSS"
          component={FontFamilyCSS}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontFamilyEx1"
          component={FontFamilyEx1}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="FontFamilyEx2"
          component={FontFamilyEx2}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TestCode"
          component={TesteCode}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TheoryView"
          component={TheoryView}
          options={{cardStyleInterpolator: forFade}}
        />
        <Stack.Screen
          name="TestCarousel"
          component={TestCarousel}
          options={{cardStyleInterpolator: forFade}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
