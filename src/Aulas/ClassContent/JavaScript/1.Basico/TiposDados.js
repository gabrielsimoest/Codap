import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function TiposDados({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("js.basic.data.dataTypesIntroduction")}
            onlyCode = {true}
            codeLanguage='JavaScript'
            code = {`let num = 10; // Number
let str = "Hello JavaScript!"; // String
let bool = true; // Boolean
let bigInt = BigInt(1234567890123456789012345678901234567890); // BigInt
let bigInt2 = 1234567890123456789012345678901234567890n; // BigInt

console.log(typeof num); // Outputs: number
console.log(typeof str); // Outputs: string
console.log(typeof bool); // Outputs: boolean
console.log(typeof bigInt); // Outputs: bigint
console.log(typeof bigInt2); // Outputs: bigint`}
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
        <TheoryView
            navigation={navigation}
            progresso="100%"
            mainText={t("js.basic.data.specialDataTypes")}
            onlyCode = {true}
            codeLanguage='JavaScript'
            code = {`let arr = [1, 2, 3]; // Array
let obj = {firstName:"John", lastName:"Doe"}; // Object
let sym = Symbol(); // Symbol
let undef; // Undefined
let nul = null; // Null
            
console.log(typeof arr); // Outputs: object
console.log(typeof obj); // Outputs: object
console.log(typeof sym); // Outputs: symbol
console.log(typeof bigInt); // Outputs: bigint
console.log(typeof undef); // Outputs: undefined
console.log(typeof nul); // Outputs: object`}
            endText={t("js.basic.data.specialDataTypesNotCoveredNow")}
            Salvar={true}
            aulaSalvar={31}
            navegar="CongratsView"
        />
    )
}