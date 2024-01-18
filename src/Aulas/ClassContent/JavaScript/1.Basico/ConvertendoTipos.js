import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConvertendoTipos({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("js.basic.types.jsTypeConversionIntro")}
            onlyCode = {true}
            codeLanguage='JavaScript'
            code = {`let num = 10; // Number
let str = num.toString(); // Convert Number to String
console.log(typeof str); // Outputs: string
            
let str2 = "10"; // String
let num2 = Number(str2); // Convert String to Number
console.log(typeof num2); // Outputs: number
            
let bool = true; // Boolean
let str3 = bool.toString(); // Convert Boolean to String
console.log(typeof str3); // Outputs: string
            
let str4 = "true"; // String
let bool2 = JSON.parse(str4); // Convert String to Boolean
console.log(typeof bool2); // Outputs: boolean`}
            navegar="ConvertendoTiposEx1"
        />
    )
}

export function ConvertendoTiposEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt={t("js.basic.types.transformingToAString")}
            pergunta={t("js.basic.types.convertCODAPToString")}
            txtantes='CODAP = '
            txtdepois='(CODAP)'
            txtCerto1='String'
            txtCerto2='String '
            txtCerto3='String'
            tamanhoInput="40%"
            navegar="ConvertendoTiposEx2"
        />
    )
}

export function ConvertendoTiposEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"40%"}
            sec={9999}
            adicionaltxt={t("js.basic.types.transformingToANumber")}
            pergunta={t("js.basic.types.convertCODAPToNumber")}
            txtantes='CODAP = '
            txtdepois='(CODAP)'
            txtCerto1='Number'
            txtCerto2='Number '
            txtCerto3='Number'
            tamanhoInput="40%"
            navegar="ConvertendoTiposEx3"
        />
    )
}

export function ConvertendoTiposEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="60%"
            sec="9999"
            pergunta={t("js.basic.types.nonNumericStringToNumber")}
            opt1="null"
            opt2="0"
            opt3='NaN'
            opt4="false"
            optCerta="opt3"
            navegar="ConvertendoTiposEx4"
        />
    )
}

export function ConvertendoTiposEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"80%"}
            sec={9999}
            adicionaltxt={t("js.basic.types.usingBooleanFunction")}
            pergunta={t("js.basic.types.convertCODAPToBoolean")}
            txtantes='CODAP = '
            txtdepois='(CODAP)'
            txtCerto1='Boolean'
            txtCerto2='Boolean '
            txtCerto3='Boolean'
            tamanhoInput="40%"
            navegar="ConvertendoTiposEx5"
        />
    )
}

export function ConvertendoTiposEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="100%"
            sec="9999"
            adicionaltxt={t("js.basic.types.stringToBooleanConversion")}
            pergunta='Boolean("0")?'
            opt1="true"
            opt2="false"
            opt3='undefined'
            opt4="NaN"
            optCerta="opt1"
            aulaSalvar={30}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}