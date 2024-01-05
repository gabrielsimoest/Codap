import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import SelectView from '../../../../components/Shared/SelectView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';

export function ColocandoMargin({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="A propriedade margin do CSS define a área de margem nos quatro lados do elemento."
            //Textos opcionais
            adicionaltxt="É uma abreviação que define todas as margens individuais de uma só vez: margin-top, margin-right , margin-bottom, e margin-left."
            adicionaltxt2="none"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColocandoMargin2"
        />
    )
}

export function ColocandoMargin2({ navigation }) {
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
            pergunta="Para o que serve a propriedade margin?"
            opt1='Para adicionar uma imagem no Elemento'
            opt2='Para adicionar uma margem no Elemento'
            opt3='Para adicionar uma borda no Elemento'
            opt4="Para adicionar uma cor no Elemento"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColocandoMargin3"
        />
    )
}

export function ColocandoMargin3({ navigation }) {
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
            pergunta="Qual é a ordem correta dos parametros do margin?"
            opt1='margin: (topo) (inferior) (direita) (esquerda);'
            opt2='margin: (direita) (inferior) (esquerda) (topo);'
            opt3='margin: (topo) (direita) (inferior) (esquerda);'
            opt4='margin: (inferior) (topo) (direita) (esquerda);'
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ColocandoMargin4"
        />
    )
}

export function ColocandoMargin4({ navigation }) {
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
            pergunta='Crie uma margin de 3px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="margin:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='3px' //Primeira opção certa
            txtCerto2='3px' //Segunda opção certa
            txtCerto3='3px' //terceira opção certa
            //Tamanho do input
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="ColocandoMargin5"
        />
    )
}

export function ColocandoMargin5({ navigation }) {
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
            pergunta='Adicione uma margem do lado direito do elemento de 2px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="div{" //Abertura primeiro elemento
            txtdepois="}" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='margin-right: 2px;' //Primeira opção certa
            txtCerto2='margin-right: 2px;' //Segunda opção certa
            txtCerto3='margin-right: 2px;' //terceira opção certa
            //Tamanho do input
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="ColocandoMargin6"
        />
    )
}

export function ColocandoMargin6({ navigation }) {
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
            pergunta='Adicione uma margem do lado esquerdo do elemento de 10px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="h1{" //Abertura primeiro elemento
            txtdepois="}" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='margin-left: 10px;' //Primeira opção certa
            txtCerto3='margin-left: 10px;' //terceira opção certa
            txtCerto2='margin-left: 10px;' //Segunda opção certa
            //Tamanho do input
            tamanhoInput="50%"
            aulaSalvar={8}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}