import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ColorCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Você pode colocar cores aos seus elementos texto usando a propriedade color."
            //Textos opcionais
            adicionaltxt="As cores aceitas variam desde valores HEX, RGB, HSL, RGBA, HSLA e cores com nomes pré definidos"
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColorEx1"
        />
    )
}

export function ColorEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="33%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Crie um estilo de cor rgb(255, 99, 71) para o h1"
            opt1='<h1 '
            opt2='style='
            opt3='</h1>'
            opt4='>'
            opt5='CODAP'
            opt6='"color:rgb(255, 99, 71)"'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:rgb(255, 99, 71)">CODAP</h1>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColorEx2"
        />
    )
}

export function ColorEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="66%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Você pode mexer na opacidade usando RGBA, sendo que o ultimo valor representa a opacidade (0 a 1)" //Opcional
            //PERGUNTA
            pergunta="Crie um estilo de cor rgb(20, 99, 71, 0.7) para o h1"
            opt1='<h1 '
            opt2='style='
            opt3='</h1>'
            opt4='>'
            opt5='CODAP'
            opt6='"color:rgb(20, 99, 71, 0.7)"'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:rgb(20, 99, 71, 0.7)">CODAP</h1>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColorEx3"
        />
    )
}

export function ColorEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Adicione uma color: #00ffff para o seletor p'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<style>" //Abertura primeiro elemento
            txtdepois="</style>" //Fechamento primeiro elemento
            txtantes2="p {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='color: #00ffff' //Primeira opção certa
            //txtCerto2='alert("CODAP")' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"

            Salvar={"true"}
            aulaSalvar="COLOR"
            navegar="CongratsView"
        />
    )
}