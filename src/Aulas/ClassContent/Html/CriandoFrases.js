import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function P({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Embora o <h*> possa escrever textos, o ideal para frases é o <p>."
            //Textos opcionais
            adicionaltxt="Funcionalmente usar um ou outro mudaria nada, mas atrapalharia a leitura do código e os mecanismos de busca."
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/P.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/P2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FraseEx1"
        />
    )
}

export function FraseEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo representa uma frase escrito CODAP?"
            opt1="<phrase>CODAP</phrase>"
            opt2="<h1>CODAP</h1>"
            opt3="<t>CODAP</t>"
            opt4="<p>CODAP</p>"
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FraseEx2"
        />
    )
}

export function FraseEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Quais os motivos de usar o <p> no lugar do <h*>?"
            opt1="O <p> é mais rápido e dinâmico"
            opt2="O <p> é mais leve e fácil de usar"
            opt3="O <p> facilita a leitura do código e de mecanismos de busca"
            opt4="O <p> coloca efeitos visuais na frase"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FraseEx3"
        />
    )
}

export function FraseEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none" //Opcional
            pergunta="Escreva uma frase que apareça Codificar é legal"
            opt1="Codificar é legal"
            opt2='<p>'
            opt3="<h6>"
            opt4="</p>"
            opt5="</h6>" //Opcional
            opt6="none" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<p>Codificar é legal</p>"
            navegar="FraseEx4"
        />
    )
}

export function FraseEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Codifique uma frase escrito HELLO WORLD"
            txtantes="<p>"
            txtdepois="</p>"
            txtCerto1="HELLO WORLD"
            txtCerto2="Hello world"
            txtCerto3="hello world"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FraseEx5"
        />
    )
}

export function FraseEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das opções está correta?"
            opt1="<phrase>texto</phrase>"
            opt2="<p><p>texto"
            opt3="<p>texto</p>"
            opt4="p=texto"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FraseEx6"
        />
    )
}

export function FraseEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Codifique uma frase escrito CODAP"
            txtantes="<p>"
            txtdepois="</p>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




