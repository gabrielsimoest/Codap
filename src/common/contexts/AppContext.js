import React, { useState, createContext } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';

const AppContext = createContext();

const AppProvider = ({ children }) => {

    const [theme, setTheme] = useState(CustomLightMode);
    const [textAppSize, setTextAppSize] = useState(20);

    const toggleTheme = (isDarkMode) => {
        setTheme(isDarkMode ? CustomLightMode : CustomDarkMode);
    };

    return (
        <AppContext.Provider value={{ theme, setTheme ,toggleTheme, textAppSize, setTextAppSize}}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
