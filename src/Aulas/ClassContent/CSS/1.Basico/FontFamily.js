import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function FontFamilyCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t('css.basic.font.FontFamilyCSS_mainText')}
            adicionaltxt={t('css.basic.font.FontFamilyCSS_additionalText')}
            adicionaltxt2="none"
            img="none"
            opt_img="none"
            opt_img2="none"
            adicionaltxt_end="none"
            navegar="FontFamilyEx1"
        />
    )
}

export function FontFamilyEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="50%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t('css.basic.font.FontFamilyEx1_question')}
            opt1='CODAP'
            opt2='style='
            opt3='</h2>'
            opt4='>'
            opt5='<h2 '
            opt6='"font-family: Arial"'
            opt7='none'
            opt8='none'
            txtCerto='<h2 style="font-family: Arial">CODAP</h2>'
            navegar="FontFamilyEx2"
        />
    )
}

export function FontFamilyEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            qtdop={2}
            layer={2}
            adicionaltxt='none'
            pergunta={t('css.basic.font.FontFamilyEx2_question')}
            txtantes="<style>"
            txtdepois="</style>"
            txtantes2="h3 {"
            txtdepois2="}"
            txtCerto1={t('css.basic.font.FontFamilyEx2_correctOption1')}
            txtCerto2={t('css.basic.font.FontFamilyEx2_correctOption2')}
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={4}
            navegar="CongratsView"
        />
    )
}