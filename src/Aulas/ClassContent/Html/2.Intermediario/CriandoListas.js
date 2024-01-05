import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Listas({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            mainText="Você pode criar listas em seu site. Para isso usamos as tags <ul> ou <ol> juntamente com o <li>."
            //Textos opcionais
            secondText="<ul> é usado para listas não ordenadas."
            thirdText="<ol> é usado para listas ordenadas."
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>
            
            <h2>Lista Não Ordenada:</h2>
            <ul>
                <li>Café</li>
                <li>Chá</li>
                <li>Leite</li>
            </ul>
            
            <h2>Lista Ordenada:</h2>
            <ol>
                <li>Café</li>
                <li>Chá</li>
                <li>Leite</li>
            </ol>
            
        </body>
    </html>`}
            //Textos final opcional (aparece após as imagens)
            endText="Para lembrar mais facilmente, ul significa 'unordered list' e ol 'ordered list'."
            //HIGHLIGHT
            highlight={["ul", "ol", "li"]}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ListaEx1"
        />
    )
}

export function ListaEx1({ navigation }) {
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
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Use o < li > para criar um item com o nome de CODAP"
            txtantes="<li>"
            txtdepois="</li>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="60%"

            txtToHighlight={["CODAP", " li "]}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ListaEx2"
        />
    )
}

export function ListaEx2({ navigation }) {
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
            layer={1}
            //Texto adicional
            adicionaltxt="Vamos criar uma lista ordenada? Para isso você deve usar o < li > dentro de um < ol >."
            //pergunta/texto principal
            pergunta="Crie uma lista de 3 itens nessa ordem: Ouro, Prata, Bronze"
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<ol>" //Abertura primeiro elemento
            txtdepois="</ol>" //Fechamento primeiro elemento
            //txtantes2="" //Abertura segundo elemento
            //txtdepois2="" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<li>Ouro</li>" //Primeira opção certa
            txtCerto2="<li>Prata</li>" //Segunda opção certa
            txtCerto3="<li>Bronze</li>" //terceira opção certa

            txtToHighlight={[" li ", "ol"]}

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="ListaEx3"
        />
    )
}

export function ListaEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt="O que acha de fazermos uma não ordenada agora? Use o que você aprendeu dentro do <ul>."
            //pergunta/texto principal
            pergunta="Crie uma lista de 2 itens nessa ordem: Hello, World"
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<ul>" //Abertura primeiro elemento
            txtdepois="</ul>" //Fechamento primeiro elemento
            //txtantes2="" //Abertura segundo elemento
            //txtdepois2="" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<li>Hello</li>" //Primeira opção certa
            txtCerto2="<li>World</li>" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            
            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="ListaEx4"
        />
    )
}

export function ListaEx4({ navigation }) {
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
            pergunta="Qual elemento cria uma lista não ordenada?"
            opt1="<ol>"
            opt2="<br>"
            opt3="<div>"
            opt4="<ul>"
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ListaEx5"
        />
    )
}

export function ListaEx5({ navigation }) {
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
            pergunta="Qual elemento cria uma lista ordenada?"
            opt1="<ol>"
            opt2="<li>"
            opt3="<h1>"
            opt4="<ul>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ListaEx6"
        />
    )
}

export function ListaEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="95%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Codifique um item escrito CODAP"
            txtantes="<"
            txtdepois=">"
            txtCerto1="li>CODAP</li"
            txtCerto2="li>codap</li"
            txtCerto3="li>Codap</li"
            tamanhoInput="80%"
            aulaSalvar={15}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




