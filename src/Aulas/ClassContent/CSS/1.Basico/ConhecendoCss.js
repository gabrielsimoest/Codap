import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConhecendoCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            mainText={t("css.basic.intro.learnCSS")}
            //Textos opcionais
            secondText={t("css.basic.intro.cssDirectOrStyleTags")}
            thirdText={t("css.basic.intro.inlineStyle")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                background-color: #b6b6b6; /* Background color for the body */
            }
            .container {
                background-color: #714b2f; /* Background color for the container class */
                width: 90%;
                margin: auto;
                padding: 20px;
                box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3); /* Soft shadow */
            }
            p {
                font-size: 17px; /* Font-size */
            }
        </style>
    </head>
    <body>
        <div class="container" style="border-radius: 15px"> <!-- CSS inline to add round borders -->
            <h1 style="text-align: center">Bem-vindo ao Meu Site</h1> <!-- CSS inline to center -->
            <p>Este é um exemplo de como usar CSS para um site mais elegante.</p>
        </div>
    </body>
</html>`}
            //Textos final opcional (aparece após as imagens)
            endText={t("css.basic.intro.cssExample")}
            
            highlight={["CSS", "style", "Cody", "link", "p", "body", "container", "seletores", "selectors", "inline", "seletor de classe", "class selector"]}   
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CSSEx1"
        />
    )
}

export function CSSEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="33%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta={t("css.basic.intro.roleOfCSS")}
            opt1={t("css.basic.intro.addStyles")}
            opt2={t("css.basic.intro.addNewMechanics")}
            opt3={t("css.basic.intro.addNotifications")}
            opt4={t("css.basic.intro.addTranslations")}
            optCerta="opt1"

            txtToHighlight={["CSS"]}

            navegar="CSSEx2"
        />
    )
}

export function CSSEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="66%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta={t("css.basic.intro.h1SelectorIndication")}
            opt1={t("css.basic.intro.h1ElementDeleted")}
            opt2={t("css.basic.intro.h1ElementReplacedByH2")}
            opt3={t("css.basic.intro.h1ElementObtainStyles")}
            opt4={t("css.basic.intro.h1ElementExecutedAsJS")}
            optCerta="opt3"

            txtToHighlight={["h1"]}
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="CSSEx3"
        />
    )
}

export function CSSEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt={t("css.basic.intro.cssInsideTag")} //Opcional
            //PERGUNTA
            pergunta={t("css.basic.intro.createBlueColorStyleForH1")}
            opt1='<h1 '
            opt2='style='
            opt3='"color:blue"'
            opt4='>'
            opt5='CODAP'
            opt6='</h1>'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:blue">CODAP</h1>'
            Salvar={true}
            aulaSalvar={3}

            txtToHighlight={["blue", "h1", "azul", "style", "diretamente", "directly", "tag-name", "nome-tag", "seu-estilo", "your-style"]}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}