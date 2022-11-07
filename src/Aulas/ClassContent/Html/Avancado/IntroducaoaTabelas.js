import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import NestingView from '../../../../Helpers/NestingView';

export function ITableTeoric({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="18%"
            //Texto principal
            txt="Tabelas são muito utilizadas para a apresentação de dados para o usúario"
            //Textos opcionais
            adicionaltxt="Para isso, o HTML possui o elemento <Table>, onde é possivel criar uma estrutura de Tabelas"
            adicionaltxt2="O atributo <tr> define as linhas e o <td> as colunas."
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ITable1"
        />
    )
}

export function ITable1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="36%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Como é definido o Elemento da Tabela?'
            opt1='<table>'
            opt2='<tr>'
            opt3='<th>'
            opt4='<td>'
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ITable2"
        />
    )
}

export function ITable2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="54%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Como é definido uma linha na Tabela?'
            opt1='<table>'
            opt2='<tr>'
            opt3='<th>'
            opt4='<td>'
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ITable3"
        />
    )
}

export function ITable3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Como é definido um título na Tabela?'
            opt1='<table>'
            opt2='<tr>'
            opt3='<th>'
            opt4='<td>'
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ITable4"
        />
    )
}

export function ITable4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="90%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Como é definido um bloco da Tabela?'
            opt1='<table>'
            opt2='<tr>'
            opt3='<th>'
            opt4='<td>'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ITable5"
        />
    )
}

export function ITable5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="50"  
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt="none"
            //pergunta/texto principal
            pergunta="Crie uma Tabela que tenha uma coluna escrito Codap"
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Table>" //Abertura primeiro elemento
            txtdepois="</Table>" //Fechamento primeiro elemento
            txtantes2="<th>" //Abertura segundo elemento
            txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<tr>" //Primeira opção certa
            txtCerto2="codap" //Segunda opção certa
            txtCerto3="</tr>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}




