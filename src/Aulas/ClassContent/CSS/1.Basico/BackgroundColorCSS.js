import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function BackgroungColorCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t("css.basic.background.backgroundColorCSS_description")}
            adicionaltxt={t("css.basic.background.backgroundColorCSS_usage")}
            adicionaltxt2="none"
            img="none"
            opt_img="none"
            opt_img2="none"
            adicionaltxt_end="none"
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
            opt6='"background-color:blue"'
            opt7='none'
            opt8='none'
            txtCerto='<body style="background-color:blue">CODAP</body>'
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
            navegar="CongratsView"
        />
    )
}