import React, { useState, createContext } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';

const AppContext = createContext();

const AppProvider = ({ children }) => {

    const [theme, setTheme] = useState(CustomLightMode);
    const [textAppSize, setTextAppSize] = useState(20);

    const ToggleTheme = (isSwitchOn) => {
        const newSwitchState = !isSwitchOn; // Calcula o novo estado do switch
    
        // Use um operador ternário para alternar entre os temas com base no tema atual
        const newTheme = theme === CustomLightMode ? CustomDarkMode : CustomLightMode;
    
        setTheme(newTheme); // Define o novo tema
        return newSwitchState; // Atualiza o estado do switch
    };

    return (
        <AppContext.Provider value={{ theme, ToggleTheme, textAppSize, setTextAppSize }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
