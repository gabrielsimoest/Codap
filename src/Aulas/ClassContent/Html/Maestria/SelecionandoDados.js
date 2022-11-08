import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import NestingView from '../../../../Helpers/NestingView';

export function SelecionandoDados({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="O elemento HTML select (<select>) representa um controle que apresenta um menu de opções."
            //Textos opcionais
            adicionaltxt="As opções dentro do menu são representadas pelo elemento <option>, que podem ser agrupados por elementos <optgroup>."
            adicionaltxt2="Essas opções podem ser pré-selecionadas para o usuário."
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="SelecionandoDados2"
        />
    )
}

export function SelecionandoDados2({ navigation }) {
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
            pergunta="Com qual Elemento é possivel adicionar opções em um menu selecionar?"
            opt1="<option>"
            opt2="<file>"
            opt3="<select>"
            opt4="<p>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="SelecionandoDados3"
        />
    )
}

export function SelecionandoDados3({ navigation }) {
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
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Com qual Elemento é possível criar um menu para selecionar?"
            opt1="<menu>"
            opt2="<h1>"
            opt3="<select>"
            opt4="<option>"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="SelecionandoDados4"
        />
    )
}

export function SelecionandoDados4({ navigation }) {
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
            pergunta="Qual desses Elementos é uma opção no menu selecionar?"
            opt1="<option>Valor1</option>"
            opt2="<option>Valor1"
            opt3='<option value="Valor1">'
            opt4="<option>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="SelecionandoDados5"
        />
    )
}

export function SelecionandoDados5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Adicione 2 opções no menu selecionar com os valores "valor1" e "valor2"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<body>" //Abertura primeiro elemento
            txtdepois="</body>" //Fechamento primeiro elemento
            txtantes2="<select>" //Abertura segundo elemento
            txtdepois2="</select>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<option>Valor1</option>' //Primeira opção certa
            txtCerto2='<option>Valor2</option>' //Segunda opção certa
            txtCerto3='<option>Valor2</option>>' //terceira opção certa
            //Tamanho do input
            tamanhoInput="70%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="SelecionandoDados6"
        />
    )
}

export function SelecionandoDados6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="96%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Crie um menu selecionar com uma opção que possui o valor "valor3"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<body>" //Abertura primeiro elemento
            txtdepois="</body>" //Fechamento primeiro elemento
            //txtantes2="<select>" //Abertura segundo elemento
            //txtdepois2="</select>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<select>' //Primeira opção certa
            txtCerto2='<option>Valor3</option>' //Segunda opção certa
            txtCerto3='</select>' //terceira opção certa
            //Tamanho do input
            tamanhoInput="70%"
            aulaSalvar="SELECIONANDODADOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}
