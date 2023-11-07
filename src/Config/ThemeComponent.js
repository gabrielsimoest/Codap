import React, { useState, useRef, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, TouchableOpacity, } from "react-native";
import '../Translations/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native-paper';
import AText from "../Helpers/AText";
import { useTheme, DefaultTheme } from '@react-navigation/native';
import { AppContext } from '../common/Contexts/AppContext';


const ThemeComponent = () => {
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const { theme, toggleTheme } = useContext(AppContext);

    React.useEffect(() => {
        // setIsSwitchOn(currentAppThemeRead);
    }, []);

    const onToggleSwitch = () => {
        const newSwitchState = !isSwitchOn; // Calcula o novo estado do switch
        setIsSwitchOn(newSwitchState); // Atualiza o estado do switch
    
        // Chame a função para alternar o tema com o novo estado
        toggleTheme(!newSwitchState);
    };
    

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.background }]} onPress={() => onToggleSwitch()}>
            <AText style={[styles.text, { color: colors.text }]} defaultSize={20}>{t("theme")}</AText>
            <Switch style={{ marginTop: 5 }} value={isSwitchOn} onValueChange={onToggleSwitch} color={'#5469D3'} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        height: 60,
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: '#141f29',
        borderRadius: 10,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    text: {
        color: "white",
    },
});

export default ThemeComponent;
