import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Comparação({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Estaremos vendo agora algumas comparações."
            //Textos opcionais
            adicionaltxt="As comparações são essas: > (maior), < (menor), == (igual), >= (maior igual), <= (menor igual) e != (diferente)"
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComparaçãoEx1"
        />
    )
}

export function ComparaçãoEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="20%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="A comparação retorna true ou false." //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo representa true?"
            opt1="2 > 2"
            opt2="3 != 3"
            opt3='4 == 5'
            opt4="4 <= 5"
            optCerta="opt4"
            navegar="ComparaçãoEx2"
        />
    )
}

export function ComparaçãoEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Crie um alert em que o resultado seja false"
            opt1=' > '
            opt2='alert'
            opt3='4'
            opt4='('
            opt5=')'
            opt6='5'
            opt7=';'
            opt8='none'
            txtCerto='alert(4 > 5);'
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="ComparaçãoEx3"
        />
    )
}

export function ComparaçãoEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="60%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo é falso?"
            opt1="1 == 1"
            opt2="1 != 0"
            opt3='1 > 5'
            opt4="1 < 5"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComparaçãoEx4"
        />
    )
}

export function ComparaçãoEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='No caso de comparar strings, o critério será a posição da letra no alfabeto.' //Opcional
            //PERGUNTA
            pergunta="Sabendo disso, qual dos casos a seguir é true?"
            opt1="a > z"
            opt2="z > a"
            opt3="z == a"
            opt4="z <= a"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComparaçãoEx5"
        />
    )
}

export function ComparaçãoEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='Para strings de mais de uma letra, será considerado até a primeira letra diferente.' //Opcional
            //PERGUNTA
            pergunta="Sabendo disso, qual dos casos a seguir é true?"
            opt1="aa > aa"
            opt2="aa != aa"
            opt3="ab == aa"
            opt4="ab > aa"
            optCerta="opt4"
            Salvar={true}
            aulaSalvar={34}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





