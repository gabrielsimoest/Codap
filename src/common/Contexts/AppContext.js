// AppContext.js
import React, { useState, createContext, useEffect } from 'react';
import { CustomDarkMode, CustomLightMode } from '../Themes/DefaultThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/Shared/CustomAlert';
import PushNotification from 'react-native-push-notification';
import { useTranslation } from 'react-i18next';
import i18n from '../../Translations/i18n/i18n';

const AppContext = createContext();

const AppProvider = ({ children }) => {

    const [theme, setTheme] = useState(null); //Tema
    const [FontSize, setFontSize] = useState(null); //Fonte
    const [notificationState, setNotificationState] = useState(null) //Notificação
    const [alert, setAlert] = useState({ title: null, message: null }); //Alerta
    const [isAlertVisible, setAlertVisible] = useState(false); //Alerta
    const [currentLanguage, setLanguage] = useState(null); //Idioma

    const { t, i18n: translate } = useTranslation();

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

        const getNotificationKeyFromStorage = async () => {
            try {
                const notificationKey = await AsyncStorage.getItem('@notification_key');
                setNotificationState(notificationKey ? notificationKey === 'true' : false);
            } catch (error) {
                console.log(error);
            }
        };

        const getLanguageFromStorage = async () => {
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
        }

        getThemeFromStorage();
        getFontSizeFromStorage();
        getLanguageFromStorage();
        getNotificationKeyFromStorage();
    }, []);

    /**********************************FONTE**********************************/
    // Guardar fonte
    const storeFont = async (value) => {
        try {
            await AsyncStorage.setItem("CurrentFontSize", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    };

    // Trocar fonte
    const toggleFont = (value) => {
        setFontSize(value);
        storeFont(value);
    };

    /**********************************TEMA**********************************/
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

    /**********************************ALERTA**********************************/
    // Mostrar alerta
    const showAlert = (title, message) => {
        setAlert({ title, message });
        setAlertVisible(true);
    };

    // Desabilitar alerta
    const disableAlert = () => {
        setAlertVisible(false);
    };

    /**********************************NOTIFICAÇÃO**********************************/
    // Guardar estado da notificação
    const storeNotificationState = async (value) => {
        try {
            await AsyncStorage.setItem("@notification_key", JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    }

    // Trocar estado da notificação
    const toggleNotification = (value) => {
        setNotificationState(value);
        storeNotificationState(value);
    };

    // Agendar notificação
    useEffect(() => {
        const channelCreate = () => {
            PushNotification.createChannel({
                channelId: "notif-channel",
                channelName: "Notification Channel"
            });
        };

        const scheduleNotification = () => {
            PushNotification.localNotificationSchedule({
                channelId: "notif-channel",
                date: new Date(Date.now() + (3600 * 1000)), // 1 hour later
                id: 1,
                title: translate.t("notificationService.title"),
                message: translate.t("notificationService.message"),
                vibrate: false,
                //vibration: false,
                playSound: false,
                //soundName: 'default',
                repeatType: 'day',
                repeatTime: 4,
            });
        };

        const cancelNotification = () => {
            PushNotification.cancelAllLocalNotifications();
        };

        if (notificationState !== null) {
            if (notificationState) {
                channelCreate();
                scheduleNotification();
            } else {
                cancelNotification();
            }
        };
    }, [notificationState]);


    // Renderização apenas se possui uma fonte e um tema definidos
    if (!theme || FontSize === null) {
        return null; // ou tela de carregamento personalizada
    }

    return (
        <AppContext.Provider value={{ theme, toggleTheme, FontSize, toggleFont, showAlert, notificationState, toggleNotification, currentLanguage }}>
            {children}
            {alert.message && alert.title && <CustomAlert visible={isAlertVisible} title={alert.title} message={alert.message} onDismiss={disableAlert} buttonText={"Ok"} />}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
