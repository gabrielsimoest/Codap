import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ColorCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t("css.basic.color.colorPropertyUsage")}
            adicionaltxt={t("css.basic.color.acceptedColorValues")}
            adicionaltxt2="none"
            img="none"
            opt_img="none"
            opt_img2="none"
            adicionaltxt_end="none"
            navegar="ColorEx1"
        />
    )
}

export function ColorEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="33%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("css.basic.color.createRGBColorStyleForH1")}
            opt1='<h1 '
            opt2='style='
            opt3='</h1>'
            opt4='>'
            opt5='CODAP'
            opt6='"color:rgb(255, 99, 71)"'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:rgb(255, 99, 71)">CODAP</h1>'
            navegar="ColorEx2"
        />
    )
}

export function ColorEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="66%"
            sec="9999"
            adicionaltxt={t("css.basic.color.opacityWithRGBA")}
            pergunta={t("css.basic.color.createRGBAColorStyleForH1")}
            opt1='<h1 '
            opt2='style='
            opt3='</h1>'
            opt4='>'
            opt5='CODAP'
            opt6='"color:rgb(20, 99, 71, 0.7)"'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:rgb(20, 99, 71, 0.7)">CODAP</h1>'
            navegar="ColorEx3"
        />
    )
}

export function ColorEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            qtdop={1}
            layer={2}
            adicionaltxt='none'
            pergunta={t("css.basic.color.addColorForSelectorP")}
            txtantes="<style>"
            txtdepois="</style>"
            txtantes2="p {"
            txtdepois2="}"
            txtCerto1='color: #00ffff;'
            txtCerto2='color: #00ffff'
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={2}
            navegar="CongratsView"
        />
    )
}