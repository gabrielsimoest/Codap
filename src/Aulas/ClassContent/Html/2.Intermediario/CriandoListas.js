import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Listas({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.inter.lists.createListsIntroduction")}
            secondText={t("html.inter.lists.unorderedListExplanation")}
            thirdText={t("html.inter.lists.orderedListExplanation")}
            endText={t("html.inter.lists.listRememberTip")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>

            <h2>Lista Não Ordenada:</h2>
            <ul>
                <li>Café</li>
                <li>Chá</li>
                <li>Leite</li>
            </ul>
            
            <h2>Lista Ordenada:</h2>
            <ol>
                <li>Café</li>
                <li>Chá</li>
                <li>Leite</li>
            </ol>

        </body>
    </html>`}
            highlight={["ul", "ol", "li"]}
            navegar="ListaEx1"
        />
    )
}

export function ListaEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            pergunta={t("html.inter.lists.createListItemQuestion")}
            txtantes="<li>"
            txtdepois="</li>"
            tamanhoInput="60%"
            txtToHighlight={["CODAP", " li "]}
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            navegar="ListaEx2"
        />
    )
}

export function ListaEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            qtdop={3}
            layer={1}
            adicionaltxt={t("html.inter.lists.createOrderedListInstruction")}
            pergunta={t("html.inter.lists.createOrderedListQuestion")}
            txtantes="<ol>"
            txtdepois="</ol>"
            txtCerto1="<li>Ouro</li>"
            txtCerto2="<li>Prata</li>"
            txtCerto3="<li>Bronze</li>"
            txtToHighlight={[" li ", "ol"]}
            tamanhoInput="46%"
            navegar="ListaEx3"
        />
    )
}

export function ListaEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            qtdop={2}
            layer={1}
            adicionaltxt={t("html.inter.lists.createUnorderedListInstruction")}
            pergunta={t("html.inter.lists.createUnorderedListQuestion")}
            txtantes="<ul>"
            txtdepois="</ul>"
            txtCerto1="<li>Hello</li>"
            txtCerto2="<li>World</li>"
            tamanhoInput="46%"
            navegar="ListaEx4"
        />
    )
}

export function ListaEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            pergunta={t("html.inter.lists.unorderedListElementQuestion")}
            opt1="<ol>"
            opt2="<br>"
            opt3="<div>"
            opt4="<ul>"
            optCerta="opt4"
            navegar="ListaEx5"
        />
    )
}

export function ListaEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            pergunta={t("html.inter.lists.orderedListElementQuestion")}
            opt1="<ol>"
            opt2="<li>"
            opt3="<h1>"
            opt4="<ul>"
            optCerta="opt1"
            navegar="ListaEx6"
        />
    )
}

export function ListaEx6({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            pergunta={t("html.inter.lists.codeListItemCODAPQuestion")}
            txtantes="<"
            txtdepois=">"
            txtCerto1="li>CODAP</li"
            txtCerto2="li>codap</li"
            txtCerto3="li>Codap</li"
            tamanhoInput="80%"
            aulaSalvar={15}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}