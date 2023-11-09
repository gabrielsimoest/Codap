import React from 'react';
import { useTranslation } from 'react-i18next';
import {StyleSheet} from 'react-native';
import OptionView from '../../../components/Shared/OptionView';
import SelectView from '../../../components/Shared/SelectView';
import TextView from '../../../components/Shared/TextView';


export function BasicPrat1_html({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="10"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta={t("how is the title of a page made")}
            opt1={t("title1")}
            opt2={t("title2")}
            opt3={t("title3")}
            opt4={t("title4")}
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BasicPrat2_html"
        />
    )
}

export function BasicPrat2_html({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="35%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt={t("paragraphs are often used to separate text")} //Opcional
            //PERGUNTA
            pergunta={t("which of these texts is in a paragraph")}
            opt1={t("paragraph1")}
            opt2={t("paragraph2")}
            opt3={t("paragraph3")}
            opt4={t("paragraph4")}
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BasicPrat3_html"
        />
    )
}
export function BasicPrat3_html({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="10"
            adicionaltxt="none" //Opcional
            pergunta={t("code a title written Codap is awesome")}
            opt1="<h1>"
            opt2={t("text")}
            opt3={t("codap is awesome")}    
            opt4="</h1>"
            opt5="<p>" //Opcional
            opt6="</p>" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto={t("answer")} 
            navegar="BasicPrat4_html"
        />
        )
}

export function BasicPrat4_html({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="10"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt={t("buttons are often used to perform actions within websites")} //Opcional
            //PERGUNTA
            pergunta={t("code a button written CODAP")}
            txtantes="<button>"
            txtdepois="</button>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#0E151C',
    },
    scroller: {
        marginHorizontal: 5,
        marginVertical: 10,
        height: 630,
        paddingBottom: 500,
    },
    box: {
        marginLeft: "1.5%",
        marginTop: 5,
        backgroundColor: '#141f29',
        borderColor: 'rgba(99, 122, 255, 0.2)',
        height: "92%",
        width: "97%",
    },
    text: {
        margin: 20,
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold"
    },
    image: {
        margin: 10,
        height: 230,
        width: 310,
    }
    ,
    image2: {
        borderRadius: 10,
        margin: 10,
        height: 35,
        width: 310,
    },
    image3: {
        margin: 10,
        height: 100,
        width: 350,
    },
    image4: {
        margin: 10,
        height: 100,
        width: 350,
    },
    icon: {
        marginRight: 20,
        top: 10,
    },
    contant: {
        marginTop: 600,
        marginBottom: 50,
        marginVertical: 20,
        zIndex: 99,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0, 0.2)',
        backgroundColor: '#0E151C',

        shadowColor: 'rgba(0,0,0, 0.3)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 5,
        shadowOpacity: 0.28,
        shadowRadius: 4,
    },
    actionText: {
        fontFamily: 'Roboto',
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
    },
    textModal: {
        flexGrow: 1,
        fontFamily: 'Roboto',
        color: 'white',
        fontSize: 23,
        fontWeight: "bold"
    }

})