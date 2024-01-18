import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConhecendoCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt={t("css.basic.intro.learnCSS")}
            //Textos opcionais
            adicionaltxt={t("css.basic.intro.cssDirectOrStyleTags")}
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end={t("css.basic.intro.cssExample")}
            
            txtToHighlight={["CSS", "style"]}   
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
            adicionaltxt="none" //Opcional
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

            txtToHighlight={["blue", "h1"]}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}