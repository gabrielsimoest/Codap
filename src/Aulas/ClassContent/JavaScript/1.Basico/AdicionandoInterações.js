import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Interações({ navigation }) {
    const { t } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            progresso="0%"
            txt={t("js.basic.interactions.learningInteractions")}
            adicionaltxt={t("js.basic.interactions.interactionsPopupExplanation")}
            navegar="InteraçõesEx1"
        />
    )
}

export function InteraçõesEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="20%"
            sec="9999"
            qtdop={1}
            layer={1}
            pergunta={t("js.basic.interactions.createAlertTrue")}
            txtantes="<script>"
            txtdepois="</script>"
            txtCerto1='alert(true)'
            tamanhoInput="40%"
            navegar="InteraçõesEx2"
        />
    )
}

export function InteraçõesEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="40%"
            sec="9999"
            adicionaltxt={t("js.basic.interactions.promptVariableExplanation")}
            pergunta={t("js.basic.interactions.createPromptCODAP")}
            opt1='CODAP'
            opt2=' = '
            opt3='let '
            opt4='prompt('
            opt5='"DIGITE O VALOR"'
            opt6=' , '
            opt7=')'
            opt8='" "'
            txtCerto='let CODAP = prompt("DIGITE O VALOR" , " ")'
            navegar="InteraçõesEx3"
        />
    )
}

export function InteraçõesEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="60%"
            sec="9999"
            adicionaltxt={t("js.basic.interactions.confirmReturnExplanation")}
            pergunta={t("js.basic.interactions.createConfirmBOOLEAN")}
            opt1='let '
            opt2='('
            opt3='BOOLEAN'
            opt4='confirm'
            opt5=' = '
            opt6='"Ativar notificações?"'
            opt7=')'
            txtCerto='let BOOLEAN = confirm("Ativar notificações?")'
            navegar="InteraçõesEx4"
        />
    )
}

export function InteraçõesEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="80%"
            sec="9999"
            adicionaltxt={t("js.basic.interactions.defaultValueAssignedToAGE")}
            pergunta='let IDADE = prompt("Digite a idade" , "10")'
            opt1="0"
            opt2="undefined"
            opt3="null"
            opt4="10"
            optCerta="opt4"
            navegar="InteraçõesEx5"
        />
    )
}

export function InteraçõesEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            adicionaltxt={t("js.basic.interactions.valueAssignedToANSWER")}
            pergunta='let RESPOSTA = confirm("Ativar notificações?")'
            opt1="undefined"
            opt2="false"
            opt3="true"
            opt4="0"
            optCerta="opt3"
            aulaSalvar={28}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}