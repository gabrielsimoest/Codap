import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function FontSizeCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t('css.basic.fontSize.FontSizeCSS_mainText')}
            secondText={t('css.basic.fontSize.FontSizeCSS_additionalText')}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
<html>
    <body>
        <p style="font-size: 32px">Hello World!</p> <!-- 32 pixels -->
        <p style="font-size: 16pt">Hello World!</p> <!-- 16 points -->
        <p style="font-size: 50%">Hello World!</p> <!-- 50% of fathher size -->
        <p style="font-size: 1em">Hello World!</p> <!-- 1 times the father size -->
        <p style="font-size: 2rem">Hello World!</p>  <!-- 2 times the root element size -->
        <p style="font-size: 5vw">Hello World!</p> <!-- 5% screen widith -->
        <p style="font-size: 5vh">Hello World!</p> <!-- 5% screen heigth -->
        <p style="font-size: 5vmin">Hello World!</p> <!-- 5% of the minimum value between screen height and widith -->
        <p style="font-size: 5vmax">Hello World!</p> <!-- 5% of the maximum value between screen height and widith -->
    </body>
</html>`}
            endText={t('css.basic.fontSize.fontSizeCSS_usage')}
            highlight={["px", "rem", "vw", "vh", "vmin", "vmax", "x", "pt", "HTML", "font-size"]}
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
            opt6='"font-size:20px;"'
            opt7='none'
            opt8='none'
            txtCerto='<p style="font-size:20px;">CODAP</p>'
            txtToHighlight={["20", "pixels", "p"]}
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
            txtToHighlight={["color", "black", "background-color", "blue", "font-size", "20px", "p"]}
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={5}
            navegar="CongratsView"
        />
    )
}