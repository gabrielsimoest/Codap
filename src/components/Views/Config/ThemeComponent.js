import React, { useState, useCallback, useContext } from "react";
import { StyleSheet, TouchableOpacity, Button } from "react-native";
import '../../../Translations/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native-paper';
import AText from "../../Shared/AText";
import { useTheme } from '@react-navigation/native';
import { AppContext } from "../../../common/Contexts/AppContext";

const ThemeComponent = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const { toggleTheme } = useContext(AppContext);

    const ChangeTheme = () => {
        setIsSwitchOn(!isSwitchOn);
        toggleTheme();
    };

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.background }]} onPress={ChangeTheme}>
            <AText style={[styles.text, { color: colors.text }]} defaultSize={20}>{t("theme")}</AText>
            <Switch style={{ marginTop: 5 }} value={isSwitchOn}color={'#5469D3'} onChange={ChangeTheme} />
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
