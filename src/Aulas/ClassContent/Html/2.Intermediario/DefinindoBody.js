import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Body({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.inter.body.bodyContentDefinition")}
            secondText={t("html.inter.body.bodyElementsExplanation")}
            endText={t("html.inter.body.singleBodyTagReminder")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <head>
            <title>Lorem Ipsum</title>
        </head>
        <body>
            <header>
                <h1>Lorem Ipsum</h1>
            </header>

            <main>
                <p>Lorem Ipsum</p>
            </main>

            <footer>
                <p>Lorem Ipsum</p>
            </footer>
        </body>
    </html>`}
            highlight={["body", "header", "main", "footer"]}
            navegar="BodyEx1"
        />
    )
}

export function BodyEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            qtdop={2}
            layer={2}
            adicionaltxt={t("html.inter.body.headerSectionExplanation")}
            pergunta={t("html.inter.body.createHeaderWithCODAP")}
            txtantes="<body>"
            txtdepois="</body>"
            txtantes2="<header>"
            txtdepois2="</header>"
            tamanhoInput="46%"
            navegar="BodyEx2"
        />
    )
}

export function BodyEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            qtdop={1}
            layer={2}
            adicionaltxt={t("html.inter.body.mainElementExplanation")}
            pergunta={t("html.inter.body.createMainWithCODAP")}
            txtantes="<body>"
            txtdepois="</body>"
            txtantes2="<main>"
            txtdepois2="</main>"
            tamanhoInput="46%"
            navegar="BodyEx3"
        />
    )
}

export function BodyEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            qtdop={3}
            layer={2}
            adicionaltxt={t("html.inter.body.footerElementExplanation")}
            pergunta={t("html.inter.body.createFooterWithCODAP")}
            txtantes="<body>"
            txtdepois="</body>"
            txtantes2="<footer>"
            txtdepois2="</footer>"
            tamanhoInput="46%"
            navegar="BodyEx4"
        />
    )
}

export function BodyEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            pergunta={t("html.inter.body.whichElementsNotInBody")}
            opt1="<header>"
            opt2="<head>"
            opt3="<main>"
            opt4="<footer>"
            optCerta="opt2"
            navegar="BodyEx5"
        />
    )
}

export function BodyEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            pergunta={t("html.inter.body.footerPurposeQuestion")}
            opt1="Definir uma seção de rodapé"
            opt2="Definir uma seção de imagens"
            opt3="Definir o conteúdo principal"
            opt4="Definir o texto principal"
            optCerta="opt1"
            navegar="BodyEx6"
        />
    )
}

export function BodyEx6({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            pergunta={t("html.inter.body.howManyBodyTagsQuestion")}
            opt1="3"
            opt2="5"
            opt3="1"
            opt4="2"
            optCerta="opt3"
            aulaSalvar={16}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}