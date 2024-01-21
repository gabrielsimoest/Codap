import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Div({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.inter.div.divContentDefinition")}
            secondText={t("html.inter.div.divUsageExplanation")}
            thirdText={t("html.inter.div.divGenericTagNote")}
            endText={t("html.inter.div.divFutureReplacementNote")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>
            <h1>Lorem Ipsum</h1>

            <div style="background-color:lightblue">
                <h2>Lorem Ipsum</h2>
                <p>Lorem Ipsum</p>
            </div>
        </body>
    </html>`}
            highlight={["div", "main", "footer", "header", "CSS"]}
            navegar="DivEx1"
        />
    )
}

export function DivEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            qtdop={2}
            layer={2}
            pergunta={t("html.inter.div.placeTitleSubtitleInDiv")}
            txtantes="<header>"
            txtdepois="</header>"
            txtantes2="<div>"
            txtdepois2="</div>"
            txtCerto1='<h1>CODAP</h1>'
            txtCerto2='<h2>CODAP</h2>'
            tamanhoInput="40%"            
            txtToHighlight={["título", "subtítulo", "CODAP"]}
            navegar="DivEx2"
        />
    )
}

export function DivEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            qtdop={3}
            layer={3}
            pergunta={t("html.inter.div.createOrderedListInDiv")}
            txtantes="<main>"
            txtdepois="</main>"
            txtantes2="<div>"
            txtdepois2="</div>"
            txtantes3="<ol>"
            txtdepois3="</ol>"
            tamanhoInput="40%"
            txtCerto1='<li>Ouro</li>'
            txtCerto2='<li>Prata</li>'
            txtCerto3='<li>Bronze</li>'
            txtToHighlight={["div", "Ouro", "Prata", "Bronze"]}
            navegar="LineBreak"
        />
    )
}

export function LineBreak({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="56%"
            mainText={t("html.inter.div.lineBreakAestheticImprovement")}
            secondText={t("html.inter.div.lineBreakUsage")}
            endText={t("html.inter.div.lineBreakExampleNote")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>
            
            <h2>Lorem Ipsum</h2>

            <p>Lorem Ipsum</p>

            <hr>

            <p>Lorem Ipsum</p>

            <p>Lorem<br>Ipsum</p>

        </body>
    </html>`}
            highlight={["br", "hr", " Lorem Ipsum "]}
            navegar="LineBreakEx1"
        />
    )
}

export function LineBreakEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            pergunta={t("html.inter.div.whatCreatesLine")}
            opt1="<hr/>"
            opt2="<li/>"
            opt3="<br/>"
            opt4="<h6/>"
            txtToHighlight={["linha"]}
            optCerta="opt1"
            navegar="LineBreakEx2"
        />
    )
}

export function LineBreakEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            pergunta={t("html.inter.div.whatCreatesSpace")}
            opt1="<hr/>"
            opt2="<li/>"
            opt3="<br/>"
            opt4="<h6/>"
            txtToHighlight={["espaço"]}
            optCerta="opt3"
            navegar="LineBreakEx3"
        />
    )
}

export function LineBreakEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            qtdop={3}
            layer={2}
            pergunta={t("html.inter.div.addTitleSpaceLineInDiv")}
            txtantes="<header>"
            txtdepois="</header>"
            txtantes2="<div>"
            txtdepois2="</div>"
            tamanhoInput="50%"
            txtCerto1='<h1>CODAP</h1>'
            txtCerto2='<br/>'
            txtCerto3='<hr/>'
            txtToHighlight={["CODAP", "espaço", "linha", "div"]}
            aulaSalvar={17}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}