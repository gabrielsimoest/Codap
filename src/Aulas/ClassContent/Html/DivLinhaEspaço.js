import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';
import NestingView from '../../../Helpers/NestingView';

export function Div({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            txt="O <div> serve para definir uma seção genérica de conteúdos."
            //Textos opcionais
            adicionaltxt="Você pode usá-lo como subdivisão de um <main>, <footer> ou <header>"
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/H1to6.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/H1to6_2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="DivEx1"
        />
    )
}

export function DivEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="28%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Coloque um título e um subtítulo escrito CODAP dentro do <div>'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<header>" //Abertura primeiro elemento
            txtdepois="</header>" //Fechamento primeiro elemento
            txtantes2="<div>" //Abertura segundo elemento
            txtdepois2="</div>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<h1>CODAP</h1>' //Primeira opção certa
            txtCerto2="<h2>CODAP</h2>" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="DivEx2"
        />
    )
}

export function DivEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={3}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Crie uma lista ordenada, dentro do <div>, com 3 elementos escrito: Ouro, Prata, Bronze'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<main>" //Abertura primeiro elemento
            txtdepois="</main>" //Fechamento primeiro elemento
            txtantes2="<div>" //Abertura segundo elemento
            txtdepois2="</div>" //Fechamento segundo elemento
            txtantes3="<ol>" //Abertura terceiro elemento
            txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<li>Ouro</li>' //Primeira opção certa
            txtCerto2="<li>Prata</li>" //Segunda opção certa
            txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="LineBreak"
        />
    )
}

export function LineBreak({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="56%"
            //Texto principal
            txt="Você pode adicionar linhas e espaços de maneira automática ao seu site para melhorar a estética."
            //Textos opcionais
            adicionaltxt="Para isso você usa o <hr/> e o <br/> respectivamente."
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/H1to6.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/H1to6_2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LineBreakEx1"
        />
    )
}

export function LineBreakEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="O que autilizamos para criar uma linha?"
            opt1="<hr/>"
            opt2="<li/>"
            opt3="<br/>"
            opt4="<h6/>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LineBreakEx2"
        />
    )
}

export function LineBreakEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="84%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="O que usamos para colocar um espaço?"
            opt1="<hr/>"
            opt2="<li/>"
            opt3="<br/>"
            opt4="<h6/>"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LineBreakEx3"
        />
    )
}

export function LineBreakEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="95%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Adicione um título escrito CODAP, um espaço e uma linha dentro do <div>'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<header>" //Abertura primeiro elemento
            txtdepois="</header>" //Fechamento primeiro elemento
            txtantes2="<div>" //Abertura segundo elemento
            txtdepois2="</div>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<h1>CODAP</h1>' //Primeira opção certa
            txtCerto2="<br/>" //Segunda opção certa
            txtCerto3="<hr/>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="50%"
            aulaSalvar="SECAOGENERICA"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




