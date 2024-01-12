import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function FontSizeCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t('css.basic.fontSize.FontSizeCSS_mainText')}
            adicionaltxt={t('css.basic.fontSize.FontSizeCSS_additionalText')}
            adicionaltxt2="none"
            img="none"
            opt_img="none"
            opt_img2="none"
            adicionaltxt_end="none"
            navegar="FontSizeEx1"
        />
    )
}

export function FontSizeEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="50%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t('css.basic.fontSize.FontSizeEx1_question')}
            opt1='<p '
            opt2='style='
            opt3='>'
            opt4='</p>'
            opt5='CODAP'
            opt6='"font-size:20px"'
            opt7='none'
            opt8='none'
            txtCerto={t('css.basic.fontSize.FontSizeEx1_correctAnswer')}
            navegar="FontSizeEx2"
        />
    )
}

export function FontSizeEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            qtdop={3}
            layer={2}
            adicionaltxt='none'
            pergunta={t('css.basic.fontSize.FontSizeEx2_question')}
            txtantes="<style>"
            txtdepois="</style>"
            txtantes2="p {"
            txtdepois2="}"
            txtCerto1={t('css.basic.fontSize.FontSizeEx2_correctOption1')}
            txtCerto2={t('css.basic.fontSize.FontSizeEx2_correctOption2')}
            txtCerto3={t('css.basic.fontSize.FontSizeEx2_correctOption3')}
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={5}
            navegar="CongratsView"
        />
    )
}