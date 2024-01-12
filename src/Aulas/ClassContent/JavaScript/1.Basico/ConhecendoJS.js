import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConhecendoJS({ navigation }) {
    const { t } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t("js.basic.intro.helloCodyLetsLearnJS")}
            adicionaltxt={t("js.basic.intro.jsForWebsites")}
            adicionaltxt2={t("js.basic.intro.usingScriptTag")}
            navegar="JSEx1"
        />
    )
}

export function JSEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt={t("js.basic.intro.startWithHelloWorld")}
            pergunta={t("js.basic.intro.completeAlertWithString")}
            txtantes='alert('
            txtdepois=')'
            txtCerto1='"HELLO WORLD"'
            txtCerto2='"Hello world"'
            txtCerto3='"hello world"'
            tamanhoInput="75%"
            navegar="JSEx2"
        />
    )
}

export function JSEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="40%"
            sec="9999"
            qtdop={2}
            layer={1}
            adicionaltxt={t("js.basic.intro.semicolonUsageInJS")}
            pergunta={t("js.basic.intro.createTwoAlertsNoSemicolon")}
            txtantes="<script>"
            txtdepois="</script>"
            txtCerto1='alert("HELLO WORLD")'
            txtCerto2='alert("CODAP")'
            tamanhoInput="60%"
            navegar="JSEx3"
        />
    )
}

export function JSEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="60%"
            sec="9999"
            pergunta={t("js.basic.intro.correctUseOfAlert")}
            opt1="alert(=>CODAP)"
            opt2="alert=CODAP"
            opt3='alert("CODAP")'
            opt4="alert{CODAP}"
            optCerta="opt3"
            navegar="JSEx4"
        />
    )
}

export function JSEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="80%"
            sec="9999"
            adicionaltxt={t("js.basic.intro.modernJSCodeUsage")}
            pergunta={t("js.basic.intro.whatToAddForJSFunction")}
            opt1="<script>"
            opt2="<JavaScript>"
            opt3="<code>"
            opt4="<js>"
            optCerta="opt1"
            navegar="JSEx5"
        />
    )
}

export function JSEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            pergunta={t("js.basic.intro.createAnAlert")}
            opt1='alert'
            opt2=')'
            opt3='"CODAP"'
            opt4='('
            opt5=';'
            txtCerto='alert("CODAP");'
            Salvar={true}
            aulaSalvar={29}
            navegar="CongratsView"
        />
    )
}