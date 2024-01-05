import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import SelectView from '../../../../components/Shared/SelectView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';

export function AdicionandoPadding({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="A propriedade padding define uma a distância entre o conteúdo de um elemento e suas bordas."
            //Textos opcionais
            adicionaltxt="É um atalho que evita definir uma distância para cada lado separadamente (padding-top, padding-right, padding-bottom, padding-left)."
            adicionaltxt2="none"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoPadding2"
        />
    )
}

export function AdicionandoPadding2({ navigation }) {
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
            pergunta="Para o que serve a propriedade padding?"
            opt1='Para adicionar uma imagem no Elemento'
            opt2="Para adicionar uma cor no Elemento"
            opt3='Para adicionar um espaço entre o Elemento e a borda'
            opt4='Para adicionar uma borda no Elemento'
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoPadding3"
        />
    )
}

export function AdicionandoPadding3({ navigation }) {
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
            pergunta="Qual é a ordem correta dos parametros do padding?"
            opt1='padding: (topo) (direita) (inferior) (esquerda);'
            opt2='padding: (topo) (inferior) (direita) (esquerda);'
            opt3='padding: (direita) (inferior) (esquerda) (topo);'
            opt4='padding: (inferior) (topo) (direita) (esquerda);'
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoPadding4"
        />
    )
}

export function AdicionandoPadding4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="64%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt=''
            //pergunta/texto principal
            pergunta='Crie um padding de 5px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="margin:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='5px' //Primeira opção certa
            txtCerto2='5px' //Segunda opção certa
            txtCerto3='5px' //terceira opção certa
            //Tamanho do input
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="AdicionandoPadding5"
        />
    )
}

export function AdicionandoPadding5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="76%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Adicione um padding do lado direito do elemento de 4px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="div{" //Abertura primeiro elemento
            txtdepois="}" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='padding-right: 4px;' //Primeira opção certa
            txtCerto2='padding-right: 4px;' //Segunda opção certa
            txtCerto3='padding-right: 4px;' //terceira opção certa
            //Tamanho do input
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="AdicionandoPadding6"
        />
    )
}

export function AdicionandoPadding6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="90%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Adicione um padding do lado esquerdo do elemento de 8px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="h1{" //Abertura primeiro elemento
            txtdepois="}" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='padding-left: 8px;' //Primeira opção certa
            txtCerto3='padding-left: 8px;' //terceira opção certa
            txtCerto2='padding-left: 8px;' //Segunda opção certa
            //Tamanho do input
            tamanhoInput="50%"
            aulaSalvar={7}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}