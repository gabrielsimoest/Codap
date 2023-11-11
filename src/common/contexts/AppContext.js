// AppContext.js
import React, { useState, createContext, useEffect } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(null);
    const [FontSize, setFontSize] = useState(null);

    const storeFont = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentFontSize", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    const toggleFont = (value) => {
        setFontSize(value);
        storeFont(value);
    };

    const storeTheme = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentTheme", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    const toggleTheme = () => {
        setTheme(oldTheme => (oldTheme === CustomDarkMode ? CustomLightMode : CustomDarkMode));

        if (theme == CustomDarkMode)
            storeTheme(false);

        if (theme == CustomLightMode)
            storeTheme(true);
    };

    const getThemeFromStorage = async () => {
        try {
            const themeOnStorage = JSON.parse(await AsyncStorage.getItem("CurrentTheme"))
            const initialTheme = themeOnStorage ? CustomDarkMode : CustomLightMode;
            setTheme(initialTheme);
        } catch (error) {
            console.log(error);
        }
    };

    const getFontFromStorage = async () => {
        try {
            const FontOnStorage = JSON.parse(await AsyncStorage.getItem("CurrentFontSize"))
            setFontSize(FontOnStorage);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getThemeFromStorage();
        getFontFromStorage();
    }, []);

    if (!theme || FontSize === null) {
        return null; // ou sua tela de carregamento personalizada
    }

    return (
        <AppContext.Provider value={{ theme, toggleTheme, FontSize, toggleFont }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };