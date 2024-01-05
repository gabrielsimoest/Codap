import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';

export function AdicionandoLinhas({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="Agora vamos aprender sobre a quebra e a adição de linha no HTML"
            //Textos opcionais
            adicionaltxt="Para isso Utilizamos o <br> para pular uma linha e o <hr> para adicionar uma linha na tela"
            adicionaltxt2="Tambem é possivel definir o Tamanho dessa Linha Utilizando o Atributo Size"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoLinhas2"
        />
    )
}

export function AdicionandoLinhas2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="32%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='O que o Elemento <br> faz?'
            opt1='Pula uma linha'
            opt2='Adiciona uma linha na Tela'
            opt3='Adiciona uma pequena linha na tela'
            opt4='Cria uma Tabela'
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoLinhas3"
        />
    )
}

export function AdicionandoLinhas3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="48%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='O que o Elemento <hr> faz?'
            opt1='Adiciona uma linha na Tela'
            opt2='Pula uma linha'
            opt3='Cria uma Tabela'
            opt4='Adiciona uma pequena linha na tela'
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoLinhas4"
        />
    )
}

export function AdicionandoLinhas4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="64%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='O que o Atributo Size="" faz?'
            opt1='Define a quantidade de linhas'
            opt2='Mostra a quantidade de linhas'
            opt3='Define o Tamanho'
            opt4='Adiciona uma pequena linha na tela'
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoLinhas5"
        />
    )
}

export function AdicionandoLinhas5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            adicionaltxt="none"
            pergunta="Adicione uma quebra de Linhas entre os Textos"
            opt1="<p>Texto</p>"
            opt2='<br>'
            opt3='<hr>'
            opt4='<p>Texto</p>'
            opt5='none'  //Opcional
            opt6='none' //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<p>Texto</p><br><p>Texto</p>'
            navegar="AdicionandoLinhas6"
        />
    )
}

export function AdicionandoLinhas6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="94%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Adicione uma linha entre os Títulos"
            txtantes="<h1>Codap</h1>"
            txtdepois="<h2>é DEMAIS</h2>"
            txtCerto1="<hr>"
            txtCerto2="<hr>"
            txtCerto3="<hr>"
            tamanhoInput="80%"
            aulaSalvar={19}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




