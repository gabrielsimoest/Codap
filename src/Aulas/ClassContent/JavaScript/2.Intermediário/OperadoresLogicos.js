import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function IfElse({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Podemos fazer algumas comparações mais avançadas utilizado as funções if/else."
            //Textos opcionais
            adicionaltxt="Eles são bem intuitivos, imagino que não terá problemas com eles."
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="IfElseEx1"
        />
    )
}

export function IfElseEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"15%"}
            sec={9999}
            adicionaltxt='Para fazer a função if funcionar será necessário uma condição seguindo esse exemplo if(CONDIÇÃO), nesse caso, se a condição for verdadeira, ele executa um comando.'
            pergunta='Escreva uma condição X > Y.'
            txtantes='if('
            txtdepois=')'
            txtCerto1='X > Y'
            txtCerto2='X>Y'
            txtCerto3='x > y'
            tamanhoInput="75%"
            navegar="IfElseEx2"
        />
    )
}

export function IfElseEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="30%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='Caso a condição seja verdadeira, tudo o que estiver dentro das chaves será executado.'
            //pergunta/texto principal
            pergunta='Coloque um alert com o valor true e outro alert dizendo: "X é maior que Y".'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            txtantes2="if(X > Y) {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='alert(true)' //Primeira opção certa
            txtCerto2='alert("X é maior que Y")' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="60%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="IfElseEx3"
        />
    )
}


export function IfElseEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="45%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='O else trabalha em conjunto com o if. Sempre que o resultado do if for falso, o código contido dentro das chaves do else será executado.'
            //pergunta/texto principal
            pergunta='Coloque um alert com o valor false e outro alert dizendo: "X é menor que Y".'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<script>" //Abertura primeiro elemento
            txtdepois="</script>" //Fechamento primeiro elemento
            txtantes2="... else {" //Abertura segundo elemento
            txtdepois2="}" //Fechamento segundo elemento
            //txtantes3="<ol>" //Abertura terceiro elemento
            //txtdepois3="</ol>" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='alert(false)' //Primeira opção certa
            txtCerto2='alert("X é menor que Y")' //Segunda opção certa
            //txtCerto3="<li>Bronze</li>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="60%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="IfElseEx4"
        />
    )
}

export function IfElseEx4({ navigation }) {
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
            adicionaltxt="if(X != 0) pode ser escrito assim: if(X). Sempre que X tiver um valor diferente de 0, será true." //Opcional
            //PERGUNTA
            pergunta="Considerando if(X), em que caso será false?"
            opt1="X = 0"
            opt2="X = 3"
            opt3='X = -2'
            opt4="X = 0.1"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="IfElseEx5"
        />
    )
}

export function IfElseEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="75%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='if(Y == 0) pode ser escrito assim: if(!Y). Sempre que Y tiver um valor diferente de 0, será false.' //Opcional
            //PERGUNTA
            pergunta="Considerando if(!Y), em que caso será true?"
            opt1="Y = 0.1"
            opt2="Y = 10"
            opt3="Y = 0"
            opt4="Y = 1"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadorTernario"
        />
    )
}

export function OperadorTernario({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="90%"
            //Texto principal
            txt="Agora veremos os operadores ternários."
            //Textos opcionais
            adicionaltxt="A sintaxe deles é diferente mas funciona igual ao if/else de maneira resumida, mas para códigos mais complexos, opte por if e else."
            adicionaltxt2="CONDIÇÃO ? SE VERDADE : SE MENTIRA"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadorTernarioEx1"
        />
    )
}

export function OperadorTernarioEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"100%"}
            sec={9999}
            adicionaltxt='none'
            pergunta='Escreva uma condição X > Y.'
            txtantes=''
            txtdepois='? alert(true) : alert(false)'
            txtCerto1='X > Y'
            txtCerto2='X>Y'
            txtCerto3='x > y'
            tamanhoInput="30%"
            aulaSalvar={"IFELSETERNARIO"}
            Salvar="true"
            navegar="CongratsView"
        />
    )
}




