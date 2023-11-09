import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';

export function Body({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            txt="O <body> é utilizado para definir o corpo de seu projeto."
            //Textos opcionais
            adicionaltxt="Dentro dele ficam os elementos <header>, <main> e <footer>"
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Só pode haver um único <body> no projeto"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BodyEx1"
        />
    )
}

export function BodyEx1({ navigation }) {
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
            adicionaltxt="O <header> serve para determinar a seção do cabeçalho do site. Nele podem entrar elementos vistos anteriormente."
            //pergunta/texto principal
            pergunta="Crie um <header> com um título e um subtítulo escrito CODAP"
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<body>" //Abertura primeiro elemento
            txtdepois="</body>" //Fechamento primeiro elemento
            txtantes2="<header>" //Abertura segundo elemento
            txtdepois2="</header>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<h1>CODAP</h1>" //Primeira opção certa
            txtCerto2="<h2>CODAP</h2>" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR         
            navegar="BodyEx2"
        />
    )
}

export function BodyEx2({ navigation }) {
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
            layer={2}
            //Texto adicional
            adicionaltxt="O <main> indica a parte principal do corpo do documento HTML" //Opcional
            //pergunta/texto principal
            pergunta='Crie um <main> com um parágrafo escrito CODAP'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<body>" //Abertura primeiro elemento
            txtdepois="</body>" //Fechamento primeiro elemento
            txtantes2="<main>" //Abertura segundo elemento
            txtdepois2="</main>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<p>CODAP</p>" //Primeira opção certa
            //txtCerto2="" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BodyEx3"
        />
    )
}

export function BodyEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt="O <footer> indica o rodapé do seu documento HTML. Nele podem ir informações sobre o autor do site e endereços de contato." //Opcional
            //pergunta/texto principal
            pergunta='Crie um <footer> com três parágrafos escritos CODAP'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<body>" //Abertura primeiro elemento
            txtdepois="</body>" //Fechamento primeiro elemento
            txtantes2="<footer>" //Abertura segundo elemento
            txtdepois2="</footer>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<p>CODAP</p>" //Primeira opção certa
            txtCerto2="<p>CODAP</p>" //Segunda opção certa
            txtCerto3="<p>CODAP</p>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BodyEx4"
        />
    )
}

export function BodyEx4({ navigation }) {
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
            pergunta="Qual desses elementos não ficam no <body>?"
            opt1="<header>"
            opt2="<head>"
            opt3="<main>"
            opt4="<footer>"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BodyEx5"
        />
    )
}

export function BodyEx5({ navigation }) {
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
            pergunta="Qual a finalidade do <footer>?"
            opt1="Definir uma seção de rodapé"
            opt2="Definir uma seção de imagens"
            opt3="Definir o conteúdo principal"
            opt4="Definir o texto principal"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BodyEx6"
        />
    )
}

export function BodyEx6({ navigation }) {
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
            pergunta="Quantos <body> podem existir no documento HTML?"
            opt1="3"
            opt2="5"
            opt3="1"
            opt4="2"
            optCerta="opt3"
            aulaSalvar="DEFINDOUMCORPO"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




