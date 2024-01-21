import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function BackgroungColorCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("css.basic.background.backgroundColorCSS_description")}
            secondText={t("css.basic.background.backgroundColorCSS_usage")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                background-color: #f0cda2;
            }
            h1 {
                text-align: center;
                color: #5a4326;
            }
        </style>
    </head>
    <body>
        <h1>Seja Bem-vindo!</h1>
    </body>
</html>`}
            endText={t("css.basic.background.backgroundColorTags")}
            highlight={["HTML", "body", "div", "header", "background-color", "color"]}
            navegar="BackgroungColorEx1"
        />
    )
}

export function BackgroungColorEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="50%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("css.basic.background.createBlueStyleForBody_question")}
            opt1='<body '
            opt2='style='
            opt3='</body>'
            opt4='>'
            opt5='CODAP'
            opt6='"background-color:blue;"'
            opt7='none'
            opt8='none'
            txtCerto='<body style="background-color:blue;">CODAP</body>'
            txtToHighlight={["body", "blue", "azul"]}
            navegar="BackgroungColorEx2"
        />
    )
}

export function BackgroungColorEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            qtdop={2}
            layer={2}
            adicionaltxt='none'
            pergunta={t("css.basic.background.defineColorAndBackgroundForP_question")}
            txtantes="<style>"
            txtdepois="</style>"
            txtantes2="p {"
            txtdepois2="}"
            txtCerto1='color: black;'
            txtCerto2='background-color: hsl(200, 50%, 50%);'
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={1}
            txtToHighlight={["p", "hsl", "200", "50", "color", "background-color", "black"]}
            navegar="CongratsView"
        />
    )
}