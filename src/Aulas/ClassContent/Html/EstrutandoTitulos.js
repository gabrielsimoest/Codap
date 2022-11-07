import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function H1h6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Os textos principais podem ser escritos usando a tag <h1>, em que o numero ao lado do 'h' indica o tamanho do texto"
            //Textos opcionais
            adicionaltxt="none"
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/H1to6.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/H1to6_2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Quanto menor for o número, maior será a fonte do texto. Indicando seu nível de importância."
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeaderEx1"
        />
    )
}

export function HeaderEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="Normalmente o <h1> é utilizado para criação de títulos da sua página" //Opcional
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
            navegar="HeaderEx2"
        />
    )
}

export function HeaderEx2({ navigation }) {
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
            pergunta={t("how is the title of a page made")}
            opt1={t("title1")}
            opt2={t("title2")}
            opt3={t("title3")}
            opt4={t("title4")}
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeaderEx3"
        />
    )
}

export function HeaderEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="O <h2> pode ser utilizado para escrever subtítulos" //Opcional
            pergunta="Escreva um subtítulo que apareça CODAP"
            opt1="<h4>"
            opt2='<h2>'
            opt3="CODAP"
            opt4="</h1>"
            opt5="</h2>" //Opcional
            opt6="TITULO" //Opcional
            opt7="</h4>" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<h2>CODAP</h2>"
            navegar="HeaderEx4"
        />
    )
}

export function HeaderEx4({ navigation }) {
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
            pergunta="Qual das opções não está correta?"
            opt1="<h1>texto</h1>"
            opt2="<h2>texto<h2>"
            opt3="<h6>texto</h6>"
            opt4="<h2>texto</h2>"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeaderEx5"
        />
    )
}

export function HeaderEx5({ navigation }) {
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
            pergunta="Qual das opções representa um subtítulo?"
            opt1="<h2>texto</h2>"
            opt2="<title>texto<title>"
            opt3="<h8>texto</h8>"
            opt4="<text>texto</text>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeaderEx6"
        />
    )
}

export function HeaderEx6({ navigation }) {
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
            pergunta="Codifique um título escrito CODAP"
            txtantes="<h1>"
            txtdepois="</h1>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            aulaSalvar="ESTRUTURANDOTITULOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




