import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import SelectView from '../../../../Helpers/SelectView';
import OptionView from '../../../../Helpers/OptionView';
import NestingView from '../../../../Helpers/NestingView';

export function AdicionandoBordas({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            txt="A propriedade Border é utilizada para aplicar uma borda em torno do Elemento"
            //Textos opcionais
            adicionaltxt="Ela pode possuir cor, tamanho e estilo"
            adicionaltxt2="none"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoBordas2"
        />
    )
}

export function AdicionandoBordas2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="28%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Para o que serve a propriedade border?"
            opt1='Para adicionar uma imagem'
            opt2='Para adicionar uma cor'
            opt3='Para adicionar uma borda'
            opt4="Para adicionar um texto"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoBordas3"
        />
    )
}

export function AdicionandoBordas3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="42%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual é a ordem correta dos parametros do Border?"
            opt1='border: (cor) (tamanho) (estilo);'
            opt2='border: (tamanho) (estilo) (cor);'
            opt3='border: (estilo) (cor) (tamanho);'
            opt4='border: (tamanho) (cor) (estilo);'
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="AdicionandoBordas4"
        />
    )
}

export function AdicionandoBordas4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt=''
            //pergunta/texto principal
            pergunta='Crie um border solido com tamanho 20px e azul"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="border:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='20px solid blue' //Primeira opção certa
            txtCerto2='20px solid blue' //Segunda opção certa
            txtCerto3='20px solid blue' //terceira opção certa
            //Tamanho do input
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="AdicionandoBordas5"
        />
    )
}

export function AdicionandoBordas5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="30"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='É possivel utilizar o border-style para definir o estilo da borda'
            //pergunta/texto principal
            pergunta='Defina o estilo do border para sólido"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="border-style:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='solid' //Primeira opção certa
            txtCerto2='solid' //Segunda opção certa
            txtCerto3='solid' //terceira opção certa
            //Tamanho do input
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="AdicionandoBordas6"
        />
    )
}

export function AdicionandoBordas6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="84s%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="30"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='É possivel utilizar o border-color para definir a cor da borda'
            //pergunta/texto principal
            pergunta='Defina a co do border para vermelho"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="border-style:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='red' //Primeira opção certa
            txtCerto2='red' //Segunda opção certa
            txtCerto3='red' //terceira opção certa
            //Tamanho do input
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="AdicionandoBordas7"
        />
    )
}

export function AdicionandoBordas7({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="98%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="30"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='É possivel utilizar o border-width para definir o tamanho da borda'
            //pergunta/texto principal
            pergunta='Defina o tamanho do border para 25px"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="border-width:" //Abertura primeiro elemento
            txtdepois=";" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='25px' //Primeira opção certa
            txtCerto2='25px' //Segunda opção certa
            txtCerto3='25px' //terceira opção certa
            //Tamanho do input
            tamanhoInput="40%"
            aulaSalvar="ADICIONANDOBORDAS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}
