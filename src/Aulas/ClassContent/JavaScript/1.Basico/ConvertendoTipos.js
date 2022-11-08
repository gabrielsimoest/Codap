import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function ConvertendoTipos({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Em JavaScript podemos converter tipos em outros, para isso utilizamos a função String(), Boolean() e Number()"
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
            navegar="ConvertendoTiposEx1"
        />
    )
}

export function ConvertendoTiposEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt='Podemos transformar booleanas e números em strings usando a função string.'
            pergunta='Use a função String para converter let CODAP = 20 em uma string'
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
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"40%"}
            sec={9999}
            adicionaltxt='Podemos fazer o mesmo ao tranfromar booleanas e strings em números, mas se uma string conter caracteres não numéricos aparecerá NaN representando uma falha na conversão.'
            pergunta='Uma boolean true é convertida como 1 e false como 0. Sabendo disso converta let CODAP = false em número usando a função Number.'
            txtantes='CODAP = '
            txtdepois='(CODAP)'
            txtCerto1='Number'
            txtCerto2='Number '
            txtCerto3='Number'
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="ConvertendoTiposEx3"
        />
    )
}

export function ConvertendoTiposEx3({ navigation }) {
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
            pergunta="O que aparece se tentar converter uma string não numérica em um número?"
            opt1="null"
            opt2="0"
            opt3='NaN'
            opt4="false"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ConvertendoTiposEx4"
        />
    )
}

export function ConvertendoTiposEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"80%"}
            sec={9999}
            adicionaltxt='Para a função Boolean, qualquer valor será considerado true. Já 0, null, undefined, NaN, " " será false.'
            pergunta='Use a função Boolean para converter let CODAP = null em uma booleana'
            txtantes='CODAP = '
            txtdepois='(CODAP)'
            txtCerto1='Boolean'
            txtCerto2='Boolean '
            txtCerto3='Boolean'
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ConvertendoTiposEx5"
        />
    )
}

export function ConvertendoTiposEx5({ navigation }) {
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
            adicionaltxt="Sabendo que no caso de uma string, se houver ao menos um caractere a conversão Boolean é true, responda:" //Opcional
            //PERGUNTA
            pergunta='Qual o resultado da conversão Boolean("0")?'
            opt1="true"
            opt2="false"
            opt3='undefined'
            opt4="NaN"
            optCerta="opt1"
            aulaSalvar={"CONVERTENDOTIPOS"}
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





