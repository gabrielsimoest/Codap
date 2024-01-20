import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ColorCSS({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("css.basic.color.colorPropertyUsage")}
            secondText={t("css.basic.color.acceptedColorValues")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
<html>
    <head>
        <title>Colored Texts</title>
    </head>
    <body>
        <h1 style="color: #1E90FF;">Text with HEX</h1>
        <p style="color: rgb(255, 99, 71);">Text with RGB</p>
        <p style="color: rgba(60, 179, 113, 0.2);">Text with RGBA</p>
        <p style="color: hsl(120, 100%, 50%);">Text with HSL</p>
        <p style="color: hsla(240, 100%, 50%, 0.8);">Text withHSLA</p>
        <p style="color: black;">Text with default color name</p>
    </body>
</html>`}
            endText={t("css.basic.color.rgbaHsla")}
            highlight={["colors", "cores", "color", "inline", "style", "predefinidos", "RGBA", "RGB", "HSLA", "HSL", "HEX", "0", "1"]}
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
            txtToHighlight={["rgb", "255", "99", "71", "h1"]}
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
            opt6='"color:rgba(20, 99, 71, 0.7)"'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:rgba(20, 99, 71, 0.7)">CODAP</h1>'
            txtToHighlight={["rgba", "20", "99", "71", "0.7", "h1", "RGBA", "0", "1"]}
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
            adicionaltxt={t("css.basic.color.styleTag")}
            pergunta={t("css.basic.color.addColorForSelectorP")}
            txtantes="<style>"
            txtdepois="</style>"
            txtantes2="p {"
            txtdepois2="}"
            txtCerto1='color: #00ffff'
            txtCerto2='color:#00ffff'
            tamanhoInput="40%"
            Salvar={true}
            aulaSalvar={2}
            txtToHighlight={["00ffff", "p", "style", "p", ""]}
            navegar="CongratsView"
        />
    )
}