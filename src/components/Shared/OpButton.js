import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon, { Icons } from '../Icons';
import AText from './AText';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    {
        name: 'Users.db',
        location: 'default',
    },
    () => { },
    error => { console.log(error) }
);

function OpButton({ theme, title, onPressFunction, iconType, iconName, iconColor, iconSize, textColor = "white", themeColorEnable = true, AulasSalvarOp, Verify }) {

    let iconCheckColor = '#233648'//"gray"
    let iconCheckName = "checkmark-circle-outline"
    let text = JSON.stringify({AulasSalvarOp})
    if (text.includes(Verify)) {
        iconCheckColor = "#637aff" //"green"
        iconCheckName = "checkmark-circle-sharp"
    }

    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();

    //Variaveis e constantes para gerenciamento de cores
    const { colors } = useTheme();

    var myColor = colors.background

    //themeColorEnable = true por padrão. Se false, textColor é "white" por padrão
    if (themeColorEnable) {
        textColor = colors.text
    }

    var iconCheckHide;
    if (AulasSalvarOp == "" || AulasSalvarOp == null)
        iconCheckHide = "hide"
    else
        iconCheckHide = "check"

    /*******Verificação do tema do botão*******/
    //Casos em que fundo é o primary dos temas (dak e light) e são alteraveis
    if (theme === "classButton" || theme === "nextButton" || theme === "settingsButton") {
        myColor = colors.primary;
    }
    //Casos em que fundo é verde independente do tema
    else if (theme === "modalButton" || theme === "OptionButtonTrue") {
        myColor = "green";
    }
    //Casos em que fundo é vermelho independente do tema
    else if (theme === "modalButtonE") {
        myColor = "red";
    }
    //Casos em que fundo é roxo independente do tema
    else if (theme === "marketButton" || theme === "marketButton2" || theme === "modalButtonStore" || theme === "modalButtonUser") {
        myColor = "#637aff";
    }
    //Casos em que fundo é o background dos temas (dak e light) e são alteraveis
    else {
        myColor = colors.background
    }

    /*******Correção da tradução em class component*******/
    if (title === "Aumentar fonte") {
        title = t("increase")
    } else if (title === "Diminuir fonte") {
        title = t("decrease")
    } else {
        title = title
    }

    return (
        <TouchableOpacity style={[styles[theme], { backgroundColor: myColor }]} onPress={onPressFunction}>
            <Icon type={Icons[iconType]}
                name={iconName}
                color={iconColor}
                size={iconSize}
                style={styles.icon} />
            <AText style={[styles.text, { color: textColor }]} defaultSize={20}>{title}</AText>
            <Icon
                type={Icons.Ionicons}
                name={iconCheckName}
                color={iconCheckColor}
                size={32}
                style={styles[iconCheckHide]}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 15,
        //  backgroundColor: '#141f29',
        borderRadius: 20,
        shadowColor: "#637aff",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.28,
        shadowRadius: 7.00,
        elevation: 7,
    },
    secundaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 60,
        padding: 10,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
        marginBottom: 15,
        //  backgroundColor: '#141f29',
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
    classButton: {
        flexDirection: 'row',
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 63,
        width: '100%',
        marginLeft: 45,
        marginRight: 45,
        marginBottom: 15,
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        elevation: 2,
    },
    nextButton: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '92%',
        left: 16,
        height: 50,
        bottom: 30,
        backgroundColor: '#1B2B39',
        borderRadius: 20,
    },
    modalButton: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        //left: 16,
        height: 50,
        backgroundColor: 'green',
        borderRadius: 20,
    },
    modalButtonE: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        //left: 16,
        height: 50,
        backgroundColor: 'red',
        borderRadius: 20,
    },
    modalButtonStore: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '92%',
        left: 16,
        height: 50,
        borderRadius: 20,
    },
    modalButtonUser: {
        flexDirection: 'row',
        marginTop: 30,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '92%',
        left: 16,
        height: 50,
        borderRadius: 20,
    },
    marketButton: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '42%',
        right: 56,
        height: 50,
        bottom: 30,
        elevation: 20,
        backgroundColor: '#637aff',
        borderRadius: 20,
    },
    marketButton2: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '42%',
        left: 30,
        height: 50,
        bottom: 30,
        elevation: 20,
        backgroundColor: '#637aff',
        borderRadius: 20,
    },
    OptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 7,
        //   backgroundColor: '#141f29',
        borderRadius: 20,
        elevation: 10,
    },
    OptionButtonTrue: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 7,
        backgroundColor: 'green',
        borderRadius: 20,
        elevation: 10,
    },
    settingsButton: {
        flexDirection: 'row',
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: '90%',
        margin: 15,
        marginBottom: 1,
        backgroundColor: '#1B2B39',
        borderRadius: 10,
        elevation: 2,
    },
    text: {
        //position: 'absolute',
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 20,
    },
    text2: {
        fontFamily: 'Roboto',
        color: '#E5E5E5',
        fontSize: 20,
    },
    icon: {
        marginRight: 10,
    },
    check: {
        position: 'absolute',
        left: -40
    },
    hide: {
        display: 'none'
    }

})

export default OpButton;