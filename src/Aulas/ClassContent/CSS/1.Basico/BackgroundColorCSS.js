import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function BackgroungColorCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Um site todo branco nem sempre é agradável, podemos atribuir uma cor a uma seção do seu documento HTML."
            //Textos opcionais
            adicionaltxt="Para isso utilizaremos o background-color, que funciona igual ao color mas apenas para fundos."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BackgroungColorEx1"
        />
    )
}

export function BackgroungColorEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="50%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Crie um estilo de cor azul para o <body>"
            opt1='<body '
            opt2='style='
            opt3='</body>'
            opt4='>'
            opt5='CODAP'
            opt6='"background-color:blue"'
            opt7='none'
            opt8='none'
            txtCerto='<body style="background-color:blue">CODAP</body>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="BackgroungColorEx2"
        />
    )
}

export function BackgroungColorEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Defina color: black e um background-color: hsl(200, 50%, 50%) para o seletor p'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<style>" //Abertura primeiro elemento
            txtdepois="</style>" //Fechamento primeiro elemento
            txtantes2="p {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='color: black' //Primeira opção certa
            txtCerto2='background-color: hsl(200, 50%, 50%)' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"

            Salvar={"true"}
            aulaSalvar={1}
            navegar="CongratsView"
        />
    )
}