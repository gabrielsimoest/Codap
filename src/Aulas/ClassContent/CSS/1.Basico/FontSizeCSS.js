import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function FontSizeCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Podemos alterar o tamanho dos textos de seu documento HTML."
            //Textos opcionais
            adicionaltxt="Para isso utilizaremos o font-size, em que você especifica a quantia de pixels para o tamanho."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FontSizeEx1"
        />
    )
}

export function FontSizeEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="50%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Adicione um tamanho de fonte de 20 pixels para o <p>"
            opt1='<p '
            opt2='style='
            opt3='>'
            opt4='</p>'
            opt5='CODAP'
            opt6='"font-size:20px"'
            opt7='none'
            opt8='none'
            txtCerto='<body style="font-size:20px">CODAP</body>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FontSizeEx2"
        />
    )
}

export function FontSizeEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Defina color: black e um background-color: blue e um font-size: 20px para o seletor p'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<style>" //Abertura primeiro elemento
            txtdepois="</style>" //Fechamento primeiro elemento
            txtantes2="p {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='color: black' //Primeira opção certa
            txtCerto2='background-color: blue' //Segunda opção certa
            txtCerto3="font-size: 20px" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"

            Salvar={"true"}
            aulaSalvar="FONTSIZE"
            navegar="CongratsView"
        />
    )
}