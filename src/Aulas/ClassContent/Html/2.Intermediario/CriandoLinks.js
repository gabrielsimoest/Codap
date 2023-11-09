import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Links({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            txt="Vamos fazer um site dinâmico com links?"
            //Textos opcionais
            adicionaltxt="Para fazer isso você precisará definir um atributo de referência para o link e um id para o elemento que deseja navegar."
            adicionaltxt2="Você cria links usando o <a>"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx1"
        />
    )
}

export function LinksEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="28%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Vamos criar um link!" //Opcional
            //PERGUNTA
            pergunta='Primeiramente adicione o atributo href="#codap" como referência do link, não esqueça as áspas!'
            txtantes="<a "
            txtdepois=">CODAP</a>"
            txtCerto1='href="#CODAP"'
            txtCerto2='href="#Codap"'
            txtCerto3='href="#codap"'
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx2"
        />
    )
}

export function LinksEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Agora vamos transformar outro elemento em link (usaremos o <h3> como exemplo). Siga o exemplo abaixo para criar um link com o nome de CODAP e href="#codap".'
            //pergunta/texto principal
            pergunta='<h3><a href="#REF">NOME DO LINK</a></h3>'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<main>" //Abertura primeiro elemento
            txtdepois="</main>" //Fechamento primeiro elemento
            //txtantes2="" //Abertura segundo elemento
            //txtdepois2="" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<h3><a href="#codap">CODAP</a></h3>' //Primeira opção certa
            //txtCerto2="" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="80%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="LinksEx3"
        />
    )
}

export function LinksEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='Agora que você aprendeu a fazer um link, vamos fazer uma lista não ordenada de links usando <li> no lugar de <h3>.'
            //pergunta/texto principal
            pergunta='A lista deve ter 1 item com nome de CODAP e href="#codap"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<main>" //Abertura primeiro elemento
            txtdepois="</main>" //Fechamento primeiro elemento
            txtantes2="<ul>" //Abertura segundo elemento
            txtdepois2="</ul>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<li><a href="#codap">CODAP</a></li>' //Primeira opção certa
            //txtCerto2="" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="75%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="LinksEx4"
        />
    )
}

export function LinksEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Agora crie um elemento <h1> com o atributo id="codap" para atribuir ao link criado anteriomente (o id precisa ser idêntico ao href).'
            txtantes="<h1"
            txtdepois=">CODAP</h1>"
            txtCerto1='id="CODAP"'
            txtCerto2='id="Codap"'
            txtCerto3='id="codap"'
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx5"
        />
    )
}

export function LinksEx5({ navigation }) {
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
            adicionaltxt="Toda vez que clicar no link, você vai ser direcionado até o elemento que conter a referência do link." //Opcional
            //PERGUNTA
            pergunta="O que usamos para criar um link?"
            opt1="<h3>"
            opt2="<a>"
            opt3="<li>"
            opt4="<link>"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx6"
        />
    )
}

export function LinksEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="95%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das oções está certo?"
            opt1="<h3><a href=codap>CODAP</a></h3>"
            opt2="<h3><a href=#codap>CODAP</a></h3>"
            opt3='<h3><a href="#codap">CODAP</a></h3>'
            opt4="<h3><a href=>#codap>CODAP</a></h3>"
            optCerta="opt3"
            aulaSalvar="CRIANDOLINKS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




