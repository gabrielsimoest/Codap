import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './common/Contexts/AppContext';
import SplashScreen from 'react-native-splash-screen';
import { DefaultScreens, ClassesScreens } from './routes'
import i18n from './Translations/i18n/i18n';

const Stack = createStackNavigator();

//Animação stack navigation
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

function App() {
  const { theme, FontSize, currentLanguage } = useContext(AppContext);
/*   const [currentLanguage, setLanguage] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('@language_key')
      .then(value => {
        if (value !== null) {
          setLanguage(value);
          i18n.changeLanguage(value);
        } else {
          setLanguage('pt'); // idioma padrão
        }
      })
      .catch(error => {
        console.error('Error retrieving language:', error);
      });
  }, []); */

  //Dar hide apenas quando tudo estiver perfeitamente selecionado
  useEffect(() => {
    if (Platform.OS === 'android' && theme && FontSize !== null && currentLanguage) SplashScreen.hide();
  }, [theme, FontSize, currentLanguage])

  const DefaultstackScreens = DefaultScreens.map((screen) => (
    <Stack.Screen
      key={screen.name}
      name={screen.name}
      component={screen.component}
    />
  ));

  const ClassesStackScreens = ClassesScreens.map((screen) => (
    <Stack.Screen
      key={screen.name}
      name={screen.name}
      component={screen.component}
    />
  ));

  if (!theme || FontSize === null || !currentLanguage) {
    return null; // ou tela de carregamento
  }

  return (
    <NavigationContainer
      theme={theme}>
      <Stack.Navigator screenOptions={{ header: () => null }}>

        {/* DEFAULT ROUTES */}
        {DefaultstackScreens}
        {/* DEFAULT ROUTES */}

        <Stack.Group screenOptionsa={{ cardStyleInterpolator: forFade }}>
          {/* Classes ROUTES */}
          {ClassesStackScreens}
          {/* Classes ROUTES */}
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
