import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function WhileFor({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Em grande parte das linguagens de programação podemos criar laços para repetição de mensagens ou códigos, e JavaScript é uma dessas."
            //Textos opcionais
            adicionaltxt="Aprenderemos as funções while(CONDIÇÃO) e for(COMEÇO; CONDIÇÃO; O QUE FAZER)."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="WhileForEx1"
        />
    )
}

export function WhileForEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt='Começaremos com o while, como o nome já diz, ele continua repetindo o código dentro dele enquanto a condição for verdade.'
            pergunta='Coloque a condição X < 3 no while. Nesse caso, quando X >= 3, o código interno não será executado.'
            txtantes='while('
            txtdepois=')'
            txtCerto1='X < 3'
            txtCerto2='X<3'
            txtCerto3='x < 3'
            tamanhoInput="75%"
            navegar="WhileForEx2"
        />
    )
}

export function WhileForEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='Considerando que X = 0:'
            //pergunta/texto principal
            pergunta='Coloque dentro da área de código do while o seguinte: alert(X); e X++;'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            txtantes2="while(X < 10) {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='alert(X);' //Primeira opção certa
            txtCerto2='X++;' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="60%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="WhileForEx3"
        />
    )
}

export function WhileForEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="60%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Considerando X = 0 e while(X >= 5), quantas vezes o laço se repetirá?"
            opt1="6"
            opt2="5"
            opt3='0'
            opt4="4"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="WhileForEx4"
        />
    )
}

export function WhileForEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Já o for precisa de um começo onde será definido o valor inicial da variavel, de uma condição de saída e uma execução." //Opcional
            //PERGUNTA
            pergunta="Construa um for seguindo a imagem de exemplo que foi mostrada no começo."
            opt1='for'
            opt2=')'
            opt3='let X = 0;'
            opt4='X++'
            opt5='X < 10'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='for(let X = 0; X < 10; X ++)'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="WhileForEx5"
        />
    )
}

export function WhileForEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Considerando for(let X = 10; X > 5; X--), quantas vezes o laço se repetirá?"
            opt1="4"
            opt2="5"
            opt3='3'
            opt4="6"
            optCerta="opt4"
            Salvar={"true"}
            aulaSalvar={35}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





