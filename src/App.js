import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from './common/Contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { LogBox } from 'react-native';
import { DefaultScreens, ClassesScreens } from './routes'

const Stack = createStackNavigator();

//Ignorar Warning Do navigator no Timer
LogBox.ignoreLogs([
  'Warning: Cannot update a component (`ForwardRef(BaseNavigationContainer)`)',
]);

//Animação stack navigation
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

//APP
function App() {
  //Variavel para seleção de tema
  const { theme, toggleTheme } = useContext(AppContext);
  //TODO: Concertar Tradução
  //Variavel para tradução
  // const { t, i18n } = useTranslation();

  const getThemeFromStorage = async () => {
    try {
      const themeOnStorage = JSON.parse(await AsyncStorage.getItem("CurrentTheme"))

      if (themeOnStorage == true)
        toggleTheme();

    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getThemeFromStorage();
    
    //Aplicar idioma
    // AsyncStorage.getItem('@language_key')
    //   .then(value => {
    //     if (value !== null) {
    //       i18n.changeLanguage(value);
    //     }
    //   })
    //   .catch(error => {
    //     console.error('Error retrieving language:', error);
    //   });
    // if (Platform.OS === 'android') SplashScreen.hide();
  }, [])

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
