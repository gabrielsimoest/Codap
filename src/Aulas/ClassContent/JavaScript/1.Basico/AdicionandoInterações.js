import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Interações({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Agora aprenderemos alguns tipos de interações."
            //Textos opcionais
            adicionaltxt="O alert, prompt e confirm fazem surgir pop-ups que permitem interação."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="InteraçõesEx1"
        />
    )
}

export function InteraçõesEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="20%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Você já viu o alert antes, então crie que mostre o valor buleano true.'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            //txtantes2="<div>" //Abertura segundo elemento
            //txtdepois2="</div>" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='alert(true)' //Primeira opção certa
            //txtCerto2='alert("CODAP")' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="40%"
            navegar="InteraçõesEx2"
        />
    )
}

export function InteraçõesEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="O prompt pode ser atribuido a uma variavel para receber um valor escrito pelo usuário." //Opcional
            //PERGUNTA
            pergunta="prompt(titulo, padrão), onde ' ' omite o padrão. Crie uma variável CODAP que recebe o valor do prompt."
            opt1='CODAP'
            opt2=' = '
            opt3='let '
            opt4='prompt('
            opt5='"DIGITE O VALOR"'
            opt6=' , '
            opt7=')'
            opt8='" "'
            txtCerto='let CODAP = prompt("DIGITE O VALOR" , " ")'
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="InteraçõesEx3"
        />
    )
}

export function InteraçõesEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="60%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="O confirm retorna true ou false dependendo da opção que o usuário clicar, sendo elas: OK e cancelar." //Opcional
            //PERGUNTA
            pergunta="confirm(pergunta). Crie uma variável BOOLEAN que recebe o valor do confirm."
            opt1='let '
            opt2='('
            opt3='BOOLEAN'
            opt4='confirm'
            opt5=' = '
            opt6='"Ativar notificações?"'
            opt7=')'
            opt8='none'
            txtCerto='let BOOLEAN = confirm("Ativar notificações?")'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="InteraçõesEx4"
        />
    )
}

export function InteraçõesEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='Qual valor será atribuido a IDADE se o usuário não alterar o texto padrão?' //Opcional
            //PERGUNTA
            pergunta='let IDADE = prompt("Digite a idade" , "10")'
            opt1="0"
            opt2="undefined"
            opt3="null"
            opt4="10"
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="InteraçõesEx5"
        />
    )
}

export function InteraçõesEx5({ navigation }) {
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
            adicionaltxt='Qual valor será atribuido a RESPOSTA se o usuário clicar em OK?' //Opcional
            //PERGUNTA
            pergunta='let RESPOSTA = confirm("Ativar notificações?")'
            opt1="undefined"
            opt2="false"
            opt3="true"
            opt4="0"
            optCerta="opt3"
            aulaSalvar={"INTERAÇÕES"}
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





