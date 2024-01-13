import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Variaveis({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("js.basic.variables.variablesAndConstantsInJS")}
            secondText={t("js.basic.variables.twoTypesOfVariables")}
            thirdText={t("js.basic.variables.oneTypeOfConstant")}
            onlyCode = {true}
            codeLanguage='JavaScript'
            code = {`var name = "John"; // Declaring a variable using var
console.log(name); // Outputs: John
            
let age = 30; // Declaring a variable using let
console.log(age); // Outputs: 30
            
const country = "USA"; // Declaring a constant using const
console.log(country); // Outputs: USA`}
            highlight={["let", "var", "const", "JavaScript", "2", "one", "1"]}
            endText={t("js.basic.variables.explanation")}
            navegar="VariaveisEx1"
        />
    )
}

export function VariaveisEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt={t("js.basic.variables.preferLetOverVar")}
            pergunta={t("js.basic.variables.createVariableCODAPWithValue")}
            opt1='CODAP'
            opt2='10'
            opt3='let '
            opt4='5'
            opt5=' = '
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto="let CODAP = 5"
            txtToHighlight={["var", "let", "CODAP"]}
            navegar="VariaveisEx2"
        />
    )
}

export function VariaveisEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"40%"}
            sec={9999}
            adicionaltxt={t("js.basic.variables.changeVariableValue")}
            pergunta='let CODAP = 5'
            txtantes='CODAP ='
            txtdepois=''
            txtCerto1='10'
            txtCerto2='10'
            txtCerto3='10'
            tamanhoInput="65%"
            txtToHighlight={["10", "let", "CODAP", "5"]}
            navegar="VariaveisEx3"
        />
    )
}

export function VariaveisEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso={"60%"}
            sec={9999}
            adicionaltxt={t("js.basic.variables.constIsFixedValue")}
            pergunta={t("js.basic.variables.createConstantCODAPWithHelloWorld")}
            opt1='const '
            opt2='"HELLO '
            opt3='WORLD"'
            opt4=' = '
            opt5='CODAP'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='const CODAP = "HELLO WORLD"'
            txtToHighlight={["Const", "HELLO WORLD", "CODAP"]}
            navegar="VariaveisEx4"
        />
    )
}

export function VariaveisEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="80%"
            sec="9999"
            qtdop={2}
            layer={1}
            adicionaltxt={t("js.basic.variables.displayVariableValueInAlert")}
            pergunta={t("js.basic.variables.createVariableCODAPWithHelloAndAlert")}
            txtantes="<script>"
            txtdepois="</script>"
            txtCerto1='let CODAP = "HELLO"'
            txtCerto2='alert(CODAP)'
            tamanhoInput="50%"
            txtToHighlight={["var", "let", "CODAP"]}
            navegar="VariaveisEx5"
        />
    )
}

export function VariaveisEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            adicionaltxt={t("js.basic.variables.whatWillAlertDisplay")}
            pergunta="let CODAP = 9; CODAP = 10; alert(CODAP);"
            opt1="19"
            opt2="9"
            opt3='10'
            opt4="1"
            optCerta="opt3"
            aulaSalvar={32}
            Salvar={true}
            txtToHighlight={["var", "let", "CODAP"]}
            navegar="CongratsView"
        />
    )
}