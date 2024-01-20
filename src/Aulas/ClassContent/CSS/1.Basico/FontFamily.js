import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function FontFamilyCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t('css.basic.font.FontFamilyCSS_mainText')}
            secondText={t('css.basic.font.FontFamilyCSS_additionalText')}
            thirdText={t('css.basic.font.FontFamilyCSS_thirdText')}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
<html>
    <head>
        <style>
            p{
                font-size: 25px;
                padding: 5px;
            }
        </style>
    </head>
    <body>
        <p style="font-family: Times New Roman, serif;">This is a paragraph with a serif font.</p>
        <p style="font-family: Arial;">This is a paragraph with a sans-serif font.</p>
        <p style="font-family: Courier New;">This is a paragraph with a monospace font.</p>
        <p style="font-family: fantasy;">This is a paragraph with a fantasy font.</p>
        <p style="font-family: cursive;">This is a paragraph with a cursive font.</p>
    </body>
</html>`}
            navegar="FontFamilyEx1"
            highlight={["font-family", "CSS", "Serif", "Sans-serif", "Monospace", "Fantasy", "Cursive", "fontes", "fonts", "safe", "seguras", "fallback", "Times New Roman", "p"]}
            endText={t('css.basic.font.FontFamilyCSS_endText')}
        />
    )
}

export function FontFamilyEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="33%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t('css.basic.font.FontFamilyEx1_question')}
            opt1='CODAP'
            opt2='style='
            opt3='</h2>'
            opt4='>'
            opt5='<h2 '
            opt6='"font-family: Arial"'
            opt6='"font-family: Arial"'
            opt7='none'
            opt8='none'
            txtCerto='<h2 style="font-family: Arial">CODAP</h2>'
            txtToHighlight={["h2", "Arial", "font-family"]}
            navegar="FontFamilyEx2"
        />
    )
}

export function FontFamilyEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="66%"
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
            txtToHighlight={["h3", "Consolas", "font-family", "color", "black"]}
            navegar="FontFamilyEx3"
        />
    )
}

export function FontFamilyEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t('css.basic.font.FontFamilyEx3_question')}
            opt1='CODAP'
            opt2='style='
            opt3='</h1>'
            opt4='>'
            opt5='<h1 '
            opt6='"font-family: Consolas, '
            opt7='Courier New, '
            opt8='monospace"'
            txtCerto='<h1 style="font-family: Consolas, Courier New, monospace">CODAP</h1>'
            txtToHighlight={["h1", "fallback", "consolas"]}
            Salvar={true}
            aulaSalvar={4}
            navegar="CongratsView"
        />
    )
}