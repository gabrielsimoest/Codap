import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function Head({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Parabéns por chegar no nível intermediário! Agora veremos mais a fundo sobre como organizar melhor o código."
            //Textos opcionais
            adicionaltxt="O primeiro que veremos é o <head>"
            adicionaltxt2="Esse é um elemento que determina uma seção de elementos que definem dados que não são visíveis ao usuário."
            //Imagem principal
            img={require("../../../../assets/H1to6.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/H1to6_2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeadEx1"
        />
    )
}

export function HeadEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="O <title> define um título ao seu projeto. Ele não é visível no site, mostrando apenas na aba ou na barra de título do navegador." //Opcional
            pergunta="Defina um título escrito CODAP"
            opt1=">"
            opt2='CODAP'
            opt3="<"
            opt4="title"
            opt5="/" //Opcional
            opt6="<" //Opcional
            opt7=">" //Opcional
            opt8="title" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<title>CODAP</title>"
            navegar="HeadEx2"
        />
    )
}

export function HeadEx2({ navigation }) {
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
            pergunta="Por que o <title> não é visível?"
            opt1="Porque é um elemento descontinuado"
            opt2="Porque não é compativel com navegadores"
            opt3="Porque ele serve apenas para dados"
            opt4="Porque ele é muito pequeno"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeadEx3"
        />
    )
}

export function HeadEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="O <meta> utiliza atributos para definir dados sobre o site, mas por hora usaremos ele para definir o conjunto de caracteres usado." //Opcional
            pergunta='Utilize as opções abaixo para constuir um <meta> com um atributo charset="UTF-8"'
            opt1="/"
            opt2='meta'
            opt3="<"
            opt4=" charset="
            opt5='"UTF-8"' //Opcional
            opt6=">" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<meta charset="UTF-8"/>'
            navegar="HeadEx4"
        />
    )
}

export function HeadEx4({ navigation }) {
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
            pergunta="Qual dos elementos a seguir pode ir dentro do <head>?"
            opt1="<h2>"
            opt2="<li>"
            opt3="<p>"
            opt4="<title>"
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeadEx5"
        />
    )
}

export function HeadEx5({ navigation }) {
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
            pergunta="Qual a finalidade do <title>?"
            opt1="Definir um título do projeto"
            opt2="Definir o texto principal do site"
            opt3="Gerar um link para o site"
            opt4="Colocar uma imagem no site"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HeadEx6"
        />
    )
}

export function HeadEx6({ navigation }) {
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
            pergunta="Defina CODAP como um título do seu projeto"
            txtantes="<title>"
            txtdepois="</title>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




