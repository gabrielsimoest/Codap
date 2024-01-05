// AppContext.js
import React, { useState, createContext, useEffect } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/Shared/CustomAlert';

const AppContext = createContext();

const AppProvider = ({ children }) => {

    const [theme, setTheme] = useState(null); //Tema
    const [FontSize, setFontSize] = useState(null); //Fonte
    const [alert, setAlert] = useState({title: null, message: null}); //Alerta
    const [isAlertVisible, setAlertVisible] = useState(false); //Alerta

    //Obter o tema e a fonte do storage
    useEffect(() => {
        const getThemeFromStorage = async () => {
            try {
                const themeFromStorage = await AsyncStorage.getItem("CurrentTheme");
                const initialTheme = themeFromStorage ? JSON.parse(themeFromStorage) ? CustomDarkMode : CustomLightMode : CustomLightMode;
                setTheme(initialTheme);
            } catch (error) {
                console.log(error);
            }
        };

        const getFontSizeFromStorage = async () => {
            try {
                const fontSizeFromStorage = await AsyncStorage.getItem("CurrentFontSize");
                setFontSize(fontSizeFromStorage ? JSON.parse(fontSizeFromStorage) : 0);
            } catch (error) {
                console.log(error);
            }
        };

        getThemeFromStorage();
        getFontSizeFromStorage();
    }, []);

    // Guardar fonte
    const storeFont = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentFontSize", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    // Trocar donte
    const toggleFont = (value) => {
        setFontSize(value);
        storeFont(value);
    };

    // Guardar tema
    const storeTheme = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentTheme", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    // Trocar tema
    const toggleTheme = () => {
        setTheme(oldTheme => (oldTheme === CustomDarkMode ? CustomLightMode : CustomDarkMode));

        if (theme == CustomDarkMode)
            storeTheme(false);

        if (theme == CustomLightMode)
            storeTheme(true);
    };

    // Mostrar alerta
    const showAlert = (title, message) => {
        setAlert({title, message});
        setAlertVisible(true);
    };

    // Desabilitar alerta
    const disableAlert = () => {
        setAlertVisible(false);
    };

    // Renderização apenas se possui uma fonte e um tema definidos
    if (!theme || FontSize === null) {
        return null; // ou tela de carregamento personalizada
    }

    return (
        <AppContext.Provider value={{ theme, toggleTheme, FontSize, toggleFont, showAlert }}>
            {children}
            {alert.message && alert.title && <CustomAlert visible={isAlertVisible} title={alert.title} message={alert.message} onDismiss={disableAlert} buttonText={"Ok"}/>}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
