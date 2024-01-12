import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function TiposDados({ navigation }) {
    const { t } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t("js.basic.data.dataTypesIntroduction")}
            navegar="TiposDadosEx1"
        />
    )
}

export function TiposDadosEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="20%"
            sec="9999"
            adicionaltxt={t("js.basic.data.numbersVarietyExplanation")}
            pergunta={t("js.basic.data.whichOptionIsNumber")}
            opt1='let CODAP = "HELLO"'
            opt2="let CODAP = -23.99"
            opt3='let CODAP = "-10"'
            opt4="let CODAP = null"
            optCerta="opt2"
            navegar="TiposDadosEx2"
        />
    )
}

export function TiposDadosEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="40%"
            sec="9999"
            adicionaltxt={t("js.basic.data.stringsRepresentationExplanation")}
            pergunta={t("js.basic.data.whichOptionIsNotString")}
            opt1='let CODAP = "HELLO"'
            opt2="let CODAP = 'HELLO'"
            opt3='let CODAP = `HELLO`'
            opt4='let CODAP = HELLO'
            optCerta="opt4"
            navegar="TiposDadosEx3"
        />
    )
}

export function TiposDadosEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="60%"
            sec="9999"
            adicionaltxt={t("js.basic.data.bigIntExplanation")}
            pergunta={t("js.basic.data.whichOptionIsBigInt")}
            opt1="let CODAP = 1234567890123456789012345678901234567890n"
            opt2="let CODAP = 1234567890123456789012345678901234567890"
            opt3="let CODAP = '1234567890123456789012345678901234567890'"
            opt4="let CODAP {BigInt} = 1234567890123456789012345678901234567890"
            optCerta="opt1"
            navegar="TiposDadosEx4"
        />
    )
}

export function TiposDadosEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="80%"
            sec="9999"
            adicionaltxt={t("js.basic.data.booleansExplanation")}
            pergunta={t("js.basic.data.whichOneIsBoolean")}
            opt1='let CODAP = 10'
            opt2='let CODAP = "HELLO"'
            opt3='let CODAP = wrong'
            opt4='let CODAP = true'
            optCerta="opt4"
            navegar="TiposDados2"
        />
    )
}

export function TiposDados2({ navigation }) {
    const { t } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="100%"
            txt={t("js.basic.data.specialDataTypes")}
            adicionaltxt_end={t("js.basic.data.specialDataTypesNotCoveredNow")}
            Salvar={true}
            aulaSalvar={31}
            navegar="CongratsView"
        />
    )
}