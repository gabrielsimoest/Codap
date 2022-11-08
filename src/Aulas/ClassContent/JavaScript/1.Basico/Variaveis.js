import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function Variaveis({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Veremos sobre as variáveis e constantes do JavaScript. Elas podem armazenar numeros, strings e objetos."
            //Textos opcionais
            adicionaltxt="Existem 2 tipos de variáveis: let e var."
            adicionaltxt2="E uma constante: const."
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="VariaveisEx1"
        />
    )
}

export function VariaveisEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso={"0%"}
            sec={9999}
            adicionaltxt='Var e let possuem a mesma função, mas hoje em dia prefira usar o let.'
            pergunta='Crie uma variavel CODAP e atribua 5 a ele'
            opt1='CODAP'
            opt2='10'
            opt3='let '
            opt4='5'
            opt5=' = '
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto="let CODAP = 5"
            navegar="VariaveisEx2"
        />
    )
}

export function VariaveisEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"0%"}
            sec={9999}
            adicionaltxt='Você pode alterar o valor da variável atribuída anteriormente, basta escrever o nome e atribuir um novo valor. Faça isso e altere o valor para 10.'
            pergunta='let CODAP = 5'
            txtantes='CODAP ='
            txtdepois=''
            txtCerto1='10'
            txtCerto2='10'
            txtCerto3='10'
            tamanhoInput="65%"
            navegar="VariaveisEx3"
        />
    )
}

export function VariaveisEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso={"0%"}
            sec={9999}
            adicionaltxt='Const é um valor fixo, ao tentar trocar seu valor aparecerá um erro. Use-a quando tiver certeza que o valor não mudará ao longo do código.'
            pergunta='Crie uma constante CODAP e atribua "HELLO WORLD" a ele.'
            opt1='const '
            opt2='"HELLO '
            opt3='WORLD"'
            opt4=' = '
            opt5='CODAP'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='const CODAP = "HELLO WORLD"'
            navegar="VariaveisEx4"
        />
    )
}

export function VariaveisEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Você pode mostrar o valor de uma variável usando o nome dela dentro do alert.'
            //pergunta/texto principal
            pergunta='Crie uma variável CODAP = "HELLO", depois crie um alert(CODAP) para mostrar a mensagem.'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            //txtantes2="<div>" //Abertura segundo elemento
            //txtdepois2="</div>" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='let CODAP = "HELLO"' //Primeira opção certa
            txtCerto2='alert(CODAP)' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="VariaveisEx5"
        />
    )
}

export function VariaveisEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Dado o código a seguir, o que vai aparecer no alert?" //Opcional
            //PERGUNTA
            pergunta="let CODAP = 9; CODAP = 10; alert(CODAP);"
            opt1="19"
            opt2="9"
            opt3='10'
            opt4="1"
            optCerta="op3"
            aulaSalvar="VARIAVEIS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





