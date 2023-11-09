import React, { useState, createContext } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState(CustomLightMode);

    const toggleTheme = () => {
        setTheme(oldTheme => (oldTheme === CustomDarkMode ? CustomLightMode : CustomDarkMode));
    };

    return (
        <AppContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
