import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function ConhecendoJS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Olá, aqui é o NOME, vamos aprender CSS? O CSS é um mecanismo para adicionar estilos a um documento web."
            //Textos opcionais
            adicionaltxt=" O código CSS pode ser aplicado diretamente nas tags html ou ficar contido dentro das tags <style> "
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="No caso do p dentro do <style> no exemplo, todos os elementos <p> receberão aquele estilo. "
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="JSEx1"
        />
    )
}

export function JSEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual a função do CSS?"
            opt1="Adicionar estilos"
            opt2="Adicionar novas mecânicas"
            opt3='Adicionar notificações'
            opt4="Adicionar traduções "
            optCerta="opt1"
            navegar="JSEx2"
        />
    )
}

export function JSEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta=""
            opt1="alert(=>CODAP)"
            opt2="alert=CODAP"
            opt3='alert("CODAP")'
            opt4="alert{CODAP}"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="JSEx3"
        />
    )
}

export function JSEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das opções abaixo representa o uso correto do alert?"
            opt1="alert(=>CODAP)"
            opt2="alert=CODAP"
            opt3='alert("CODAP")'
            opt4="alert{CODAP}"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="JSEx4"
        />
    )
}

export function JSEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='Para fazermos o código funcionar de uma maneira moderna, adicionamos o "use strict" logo no começo.' //Opcional
            //PERGUNTA
            pergunta="O que deve ser colocado para o JavaScript funcionar?"
            opt1="<script>"
            opt2="<JavaScript>"
            opt3="<code>"
            opt4="<js>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="JSEx5"
        />
    )
}

export function JSEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Crie um alert"
            opt1='alert'
            opt2=')'
            opt3='"CODAP"'
            opt4='('
            opt5=';'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='alert("CODAP");'
            Salvar={"true"}
            aulaSalvar="CONHECENDOJS"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





