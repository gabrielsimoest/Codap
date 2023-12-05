import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function FontFamilyCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Também é possivel ajustar a fonte do seu texto pra combinar melhor com seu site."
            //Textos opcionais
            adicionaltxt="Isso é feito através do font-family."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FontFamilyEx1"
        />
    )
}

export function FontFamilyEx1({ navigation }) {
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
            pergunta="Defina a font-family para Arial no <h2>"
            opt1='CODAP'
            opt2='style='
            opt3='</h2>'
            opt4='>'
            opt5='<h2 '
            opt6='"font-family: Arial"'
            opt7='none'
            opt8='none'
            txtCerto='<h2 style="font-family: Arial">CODAP</h2>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="FontFamilyEx2"
        />
    )
}

export function FontFamilyEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Defina color: black e um font-family: consolas para o seletor h3'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<style>" //Abertura primeiro elemento
            txtdepois="</style>" //Fechamento primeiro elemento
            txtantes2="h3 {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='color: black' //Primeira opção certa
            txtCerto2='font-family: consolas' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"

            Salvar={"true"}
            aulaSalvar={4}
            navegar="CongratsView"
        />
    )
}