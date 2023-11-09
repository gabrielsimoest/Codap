import React, { useState, createContext } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(CustomLightMode);
    const [FontSize, setFontSize] = useState(20);

    const storeFont = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentFontSize", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    const toggleFont = (value) => {
        console.log(value)
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

    return (
        <AppContext.Provider value={{ theme, toggleTheme, FontSize, toggleFont }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
