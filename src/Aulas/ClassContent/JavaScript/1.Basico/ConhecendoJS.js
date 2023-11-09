import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConhecendoJS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Olá, aqui é o NOME, vamos aprender JavaScript? Essa é uma linguagem de programação utilizada junto com o HTML para criação de funcionalidades que o HTML não proporciona. "
            //Textos opcionais
            adicionaltxt="JavaScript tem outros usos, mas estaremos vendo para criação de sites."
            adicionaltxt2="Para usar ele, devemos abrir uma tag <script> em seu documento HTML para estar codificando."
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="JSEx1"
        />
    )
}

export function JSEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt='Vamos começar escrevendo seu primeiro HELLO WORLD?'
            pergunta='Complete a função alert a seguir com "HELLO WORLD", mas não esqueça as áspas para identificar como uma string.'
            txtantes='alert('
            txtdepois=')'
            txtCerto1='"HELLO WORLD"'
            txtCerto2='"Hello world"'
            txtCerto3='"hello world"'
            tamanhoInput="75%"
            navegar="JSEx2"
        />
    )
}

export function JSEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Em JavaScript, a maioria dos casos que há uma quebra de linha não é necessário o uso de ponto e vírgula. Uma das exeções é antes de [ ].'
            //pergunta/texto principal
            pergunta='Crie 2 alerts: "HELLO WORLD" e "CODAP". Sem ponto e vírgula.'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            //txtantes2="<div>" //Abertura segundo elemento
            //txtdepois2="</div>" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='alert("HELLO WORLD")' //Primeira opção certa
            txtCerto2='alert("CODAP")' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="60%"
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
            progresso="60%"
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
            progresso="80%"
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
            progresso="100%"
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





