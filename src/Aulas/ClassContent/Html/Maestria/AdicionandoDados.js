import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function AdicionandoDados({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="O elemento HTML <input> é usado para criar controles interativos para formulários baseados 
            na web para receber dados do usuário."
            //Textos opcionais
            adicionaltxt="A semântica de um <input> varia consideravelmente dependendo do valor de seu atributo type."
            adicionaltxt2="none"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoDados2"
        />
    )
}

export function AdicionandoDados2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="32%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Para o que é usado o <input>?"
            opt1="Para adicionar um video"
            opt2="Para receber dados do usuario"
            opt3="Para criar uma tabela"
            opt4="Para criar um título"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoDados3"
        />
    )
}

export function AdicionandoDados3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="48%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Um <input> possui varios tipos" //Opcional
            //PERGUNTA
            pergunta="Qual deles é usado para receber textos?"
            opt1='type="hidden"'
            opt2='type="radio"'
            opt3='type="checkbox"'
            opt4='type="text"'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoDados4"
        />
    )
}

export function AdicionandoDados4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="64%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual desses é um <input> valido?"
            opt1='<input>'
            opt2='<input>Nome</input>'
            opt3='<input type="text">"'
            opt4='<input type="text"></input>'
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoDados5"
        />
    )
}

export function AdicionandoDados5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Dica: Os inputs não precisam de Tag de Fechamento" //Opcional
            //PERGUNTA
            pergunta="Codifique um input para texto"
            txtantes="<body>"
            txtdepois="</body>"
            txtCerto1='<input type="text">'
            txtCerto2='<input type="text">'
            txtCerto3='<input type="text">'
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoDados6"
        />
    )
}

export function AdicionandoDados6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="95%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Geralmente os inputs são utilizados em senhas utilizando o Type="password"'
            //pergunta/texto principal
            pergunta='Codifique um input para senha'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<input type="password">' //Primeira opção certa
            txtCerto2='<input type="password">' //Segunda opção certa
            txtCerto3='<input type="password">' //terceira opção certa
            //Tamanho do input
            tamanhoInput="46%"
            aulaSalvar="ADCDADOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}