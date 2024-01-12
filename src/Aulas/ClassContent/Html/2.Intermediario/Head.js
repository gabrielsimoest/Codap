import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Head({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.inter.head.headIntermediateLevel")}
            secondText={t("html.inter.head.headElementExplanation")}
            thirdText={t("html.inter.head.headElementUsage")}
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
            endText={t("html.inter.head.headElementNotShown")}
            highlight={["JS", "CSS", "head"]}
            navegar="HeadEx1"
        />
    )
}

export function HeadEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt={t("html.inter.head.titleElementExplanation")}
            pergunta={t("html.inter.head.defineTitleCODAP")}
            opt1=">"
            opt2='CODAP'
            opt3="<"
            opt4="title"
            opt5="/" //Opcional
            opt6="<" //Opcional
            opt7=">" //Opcional
            opt8="title" //Opcional
            txtCerto="<title>CODAP</title>"
            navegar="HeadEx2"
        />
    )
}

export function HeadEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            pergunta={t("html.inter.head.whyTitleNotVisible")}
            opt1="Porque é um elemento descontinuado"
            opt2="Porque não é compativel com navegadores"
            opt3="Porque ele serve apenas para dados"
            opt4="Porque ele é muito pequeno"
            optCerta="opt3"
            navegar="HeadEx3"
        />
    )
}

export function HeadEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            adicionaltxt={t("html.inter.head.metaElementExplanation")}
            pergunta={t("html.inter.head.constructMetaCharset")}
            opt1="/"
            opt2='meta'
            opt3="<"
            opt4=" charset="
            opt5='"UTF-8"' //Opcional
            opt6=">" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            txtCerto='<meta charset="UTF-8"/>'
            navegar="HeadEx4"
        />
    )
}

export function HeadEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            pergunta={t("html.inter.head.whichElementInsideHead")}
            opt1="<h2>"
            opt2="<li>"
            opt3="<p>"
            opt4="<title>"
            optCerta="opt4"
            navegar="HeadEx5"
        />
    )
}

export function HeadEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            pergunta={t("html.inter.head.purposeOfTitle")}
            opt1="Definir um título do projeto"
            opt2="Definir o texto principal do site"
            opt3="Gerar um link para o site"
            opt4="Colocar uma imagem no site"
            optCerta="opt1"
            navegar="HeadEx6"
        />
    )
}

export function HeadEx6({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            pergunta={t("html.inter.head.defineCODAPAsTitle")}
            txtantes="<title>"
            txtdepois="</title>"
            tamanhoInput="46%"
            aulaSalvar={18}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}