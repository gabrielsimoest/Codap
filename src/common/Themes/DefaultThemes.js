import {
    DefaultTheme,
  } from '@react-navigation/native';

/* Gerenciamento dos temas */

//Dark mode
export const CustomDarkMode = {
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
export const CustomLightMode = {
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

/* Gerenciamento dos temas */