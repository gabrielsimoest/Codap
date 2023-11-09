import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Operadores({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Agora aprenderemos algumas operações matemáticas."
            //Textos opcionais
            adicionaltxt="Caracteres numéricos e numeros podem ser somados, subtraídos, multiplicados, divididos."
            adicionaltxt2="Além disso você pode incrementar ou decrementar variaveis."
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx1"
        />
    )
}

export function OperadoresEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="15%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Você pode deixar um valor negativo apenas usando igualando uma variavel a - ela mesma." //Opcional
            //PERGUNTA
            pergunta="let X = 5. Tranforme em -5."
            opt1='X'
            opt2='-'
            opt3='X'
            opt4=' = '
            opt5=';'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='X = -X;'
            navegar="OperadoresEx2"
        />
    )
}

export function OperadoresEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="30%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Você pode subtrair ou somar dois ou mais números e/ou variaveis." //Opcional
            //PERGUNTA
            pergunta="Considerando let X = 3 e let Y = -5, o que apareceria em alert(X - Y)?"
            opt1="-5"
            opt2="5"
            opt3='-2'
            opt4="2"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx3"
        />
    )
}

export function OperadoresEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="45%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='Para realizar multiplicação e divisão, usamos * e / respectivamente.' //Opcional
            //PERGUNTA
            pergunta="Considerando let X = 10 e let Y = 5, o que apareceria em alert(X / Y)?"
            opt1="2"
            opt2="50"
            opt3='10'
            opt4="5"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx4"
        />
    )
}

export function OperadoresEx4({ navigation }) {
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
            adicionaltxt='Você pode obter o "resto" de uma divisão INTEIRA ao utilizar a operação %.' //Opcional
            //PERGUNTA
            pergunta="Considerando let X = 5 e let Y = 3, o que apareceria em alert(X % Y)?"
            opt1="1,6"
            opt2="2"
            opt3='NaN'
            opt4="0"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx5"
        />
    )
}

export function OperadoresEx5({ navigation }) {
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
            adicionaltxt='** representa uma exponencial, sendo que o primeiro número é a base e o segundo é o expoente.' //Opcional
            //PERGUNTA
            pergunta="O que apareceria em alert(3 ** 2)?"
            opt1="6"
            opt2="12"
            opt3='9'
            opt4="0"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx6"
        />
    )
}

export function OperadoresEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="90%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt='none' //Opcional
            //PERGUNTA
            pergunta="Os conceitos matemáticos estão em dia? O que acha de criar uma raiz quadrada de 9 usando expoente?"
            opt1='('
            opt2='alert('
            opt3=')'
            opt4='2)'
            opt5='/'
            opt6='9'
            opt7='1'
            opt8=' ** '
            txtCerto='alert(9 ** (1/2))'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="OperadoresEx7"
        />
    )
}

export function OperadoresEx7({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Para incrementar ou decrementar uma variável em 1, você usa o ++ ou -- antes ou depois da variável." //Opcional
            //PERGUNTA
            pergunta="let X = 0, incremente essa variavel usando o ++ dentro do alert"
            opt1='('
            opt2='X'
            opt3=')'
            opt4='++'
            opt5='alert'
            opt6='none'
            opt7='none'
            opt8='none'
            txtCerto='alert(X++)'
            aulaSalvar={"OPERADORES"}
            Salvar="true"
            navegar="CongratsView"
        />
    )
}





