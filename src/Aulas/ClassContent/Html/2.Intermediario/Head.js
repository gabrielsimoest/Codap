import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Head({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            mainText="Parabéns por chegar no nível intermediário! Agora veremos mais a fundo sobre como organizar melhor o código."
            //Textos opcionais
            secondText="O primeiro que veremos é o <head> que  é um elemento que determina uma seção de elementos que definem dados que não são visíveis ao usuário."
            thirdText="Ele é utilizado também para carregar scripts JS e e estilos CSS como mostrado no exemplo abaixo. Mas não serão nosso foco agora."
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <head>
            <title>Título da Página</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="styles.css">
            <script src="script.js"></script>
        </head>
        <body>
            <h1>Lorem Ipsum</h1>
            <p>Lorem Ipsum</p>
        </body>
    </html>`}
            //Textos final opcional (aparece após as imagens)
            endText="Como pode ver, nada no <head> é mostrado no site."
            highlight={["JS", "CSS", "head"]}
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
            progresso="28%"
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
            progresso="42%"
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
            progresso="56%"
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
            progresso="70%"
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
            progresso="84%"
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
            progresso="95%"
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
            aulaSalvar={18}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




