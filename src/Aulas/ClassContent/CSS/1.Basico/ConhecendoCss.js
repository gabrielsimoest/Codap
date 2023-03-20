import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function ConhecendoCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt={t("lets learn CSS")}
            //Textos opcionais
            adicionaltxt={t("CSS code can be applied directly to html tags or contained within <style> tags")}
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end={t("CSS example")}
            
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
            pergunta={t("what is the role of CSS?")}
            opt1={t("add styles")}
            opt2={t("add new mechanics")}
            opt3={t("add notifications")}
            opt4={t("add translations")}
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
            pergunta={t("what does the h1 selector indicate?")}
            opt1={t("indicates that every h1 element will be deleted")}
            opt2={t("indicates that every h1 element will be replaced by h2")}
            opt3={t("indicates that every h1 element will obtain styles")}
            opt4={t("indicates that every h1 element will be executede as js")}
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
            pergunta={t("create blue color style for h1")}
            opt1='<h1 '
            opt2='style='
            opt3='"color:blue"'
            opt4='>'
            opt5='CODAP'
            opt6='</h1>'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:blue">CODAP</h1>'
            Salvar={"true"}
            aulaSalvar="CONHECENDOCSS"

            txtToHighlight={["blue", "h1"]}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





