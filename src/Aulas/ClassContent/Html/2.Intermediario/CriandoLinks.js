import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Links({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.inter.links.dynamicSiteQuestion")}
            secondText={t("html.inter.links.dynamicSiteExplanation")}
            thirdText={t("html.inter.links.dynamicSiteTagUsage")}
            endText={t("html.inter.links.dynamicSiteExample")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>
            <p><a href="#section1">Ir para a Seção 1</a></p>
            <p><a href="#section2">Ir para a Seção 2</a></p>

            <h1 id="section1">Seção 1</h1>
            <h2>Este é o conteúdo da Seção 1.</h2>
            
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
            </p>

            <h1 id="section2">Seção 2</h1>
            <h2>Este é o conteúdo da Seção 2.</h2>
            
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
            </p>
        </body>
    </html>`}
            highlight={["link", "links"]}
            navegar="LinksEx1"
        />
    )
}

export function LinksEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt={t("html.inter.links.createLinkHeader")}
            pergunta={t("html.inter.links.createLinkQuestion")}
            txtantes="<a "
            txtdepois=">CODAP</a>"
            txtCerto1='href="#codap"'
            tamanhoInput="50%"
            navegar="LinksEx2"
        />
    )
}

export function LinksEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            qtdop={1}
            layer={1}
            adicionaltxt={t("html.inter.links.transformElementHeader")}
            pergunta={t("html.inter.links.transformElementQuestion")}
            txtantes="<main>"
            txtdepois="</main>"
            txtCerto1='<h3><a href="#codap">CODAP</a></h3>'
            tamanhoInput="80%"
            navegar="LinksEx3"
        />
    )
}

export function LinksEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            qtdop={1}
            layer={2}
            adicionaltxt={t("html.inter.links.unorderedListHeader")}
            pergunta={t("html.inter.links.unorderedListQuestion")}
            txtantes="<main>"
            txtdepois="</main>"
            txtantes2="<ul>"
            txtdepois2="</ul>"
            txtCerto1='<li><a href="#codap">CODAP</a></li>'
            tamanhoInput="75%"
            navegar="LinksEx4"
        />
    )
}

export function LinksEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            pergunta={t("html.inter.links.createIdHeader")}
            txtantes="<h1"
            txtdepois=">CODAP</h1>"
            txtCerto1='Id="codap"'
            tamanhoInput="40%"
            navegar="LinksEx5"
        />
    )
}

export function LinksEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt={t("html.inter.links.linkToOtherSitesHeader")}
            pergunta={t("html.inter.links.linkToGoogleQuestion")}
            opt1="<h3 LINK: >'https://www.google.com'</h3>"
            opt2="<p><a href='https://www.google.com'>Google</a></p>"
            opt3="<li>'https://www.google.com'</li>"
            opt4="<link>'https://www.google.com'</link>"
            optCerta="opt2"
            navegar="LinksEx6"
        />
    )
}

export function LinksEx6({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            pergunta={t("html.inter.links.linkToIdQuestion")}
            opt1="<h3><a href=codap>CODAP</a></h3>"
            opt2="<h3><a href=#codap>CODAP</a></h3>"
            opt3='<h3><a href="#codap">CODAP</a></h3>'
            opt4="<h3><a href=>#codap>CODAP</a></h3>"
            optCerta="opt3"
            aulaSalvar={23}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}