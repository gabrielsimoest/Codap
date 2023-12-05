import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function TiposDados({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Existem 8 tipos de dados que você verá no exemplo e nos exercícios. Entre eles estão: numeros, strings, objetos, boolenas e outros."
            //Textos opcionais
            adicionaltxt="none"
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TiposDadosEx1"
        />
    )
}

export function TiposDadosEx1({ navigation }) {
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
            adicionaltxt="Os números variam desde números negativos para até mesmo números decimais, e não precisam estar entre áspas." //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo representa um número?"
            opt1='let CODAP = "HELLO"'
            opt2="let CODAP = -23,99"
            opt3='let CODAP = "-10"'
            opt4="let CODAP = null"
            optCerta="opt2"
            navegar="TiposDadosEx2"
        />
    )
}

export function TiposDadosEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="As strings podem ser representadas pelos 3 tipos áspas, contendo 0 ou mais caractéres." //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo não representa uma string?"
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
            adicionaltxt="Números acima de (2^53-1) e abaixo de -(2^53-1) precisam ser declarados como BigInt. Para isso adicionamos um caractére 'n' no final do número." //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo representa um BigInt?"
            opt1="let CODAP = 1234567890123456789012345678901234567890n"
            opt2="let CODAP = 1234567890123456789012345678901234567890"
            opt3="let CODAP = '1234567890123456789012345678901234567890'"
            opt4="let CODAP {BigInt} = 1234567890123456789012345678901234567890"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TiposDadosEx4"
        />
    )
}

export function TiposDadosEx4({ navigation }) {
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
            adicionaltxt='As booleanas representam dois valores apenas, true ou false' //Opcional
            //PERGUNTA
            pergunta="Qual desses representa uma boolena?"
            opt1='let CODAP = 10'
            opt2='let CODAP = "HELLO"'
            opt3='let CODAP = wrong'
            opt4='let CODAP = true'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TiposDados2"
        />
    )
}

export function TiposDados2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //Texto principal
            txt="Existem os tipos especiais: null, undefined, simbolos e objetos."
            //Textos opcionais
            adicionaltxt="none"
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Mas estes não veremos agora."
            Salvar={"true"}
            aulaSalvar={31}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





