import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';

export function IndentTeoric({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            txt="Elementos no HTML podem ser Identificados mais facilmente por meio de Atributos, para isso utilizamos o 'class' e o 'Id'."
            //Textos opcionais
            adicionaltxt="O atributo 'class' é usado para atributos que podem ser repetidos."
            adicionaltxt2="Já o atributos 'Id' é usado como identificador único."
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Indent1"
        />
    )
}

export function Indent1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            adicionaltxt="none"
            pergunta="Crie uma div com um identificador unico"
            opt1="</"
            opt2='<'
            opt3='div>'
            opt4='>'
            opt5=' Class='  //Opcional
            opt6='"Identificador1"' //Opcional
            opt7="div" //Opcional
            opt8=" Id=" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<div Id="Identificador1"></div>'
            navegar="Indent2"
        />
    )
}

export function Indent2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="42%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="30"
            adicionaltxt="none"
            pergunta="Crie uma div com um identificador múltiplo"
            opt1="</"
            opt2='<'
            opt3='div>'
            opt4='>'
            opt5=' Class='  //Opcional
            opt6='"Identificador1"' //Opcional
            opt7="div" //Opcional
            opt8=" Id=" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<div Class="Identificador1"></div>'
            navegar="Indent3"
        />
    )
}

export function Indent3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Ambos os atributos Id e Class possuem a mesma função, porém regras diferentes." //Opcional
            //PERGUNTA
            pergunta='Qual dessas opções expressa corretamente o uso de Id="" e Class=""?'
            opt1='Class é usada como um idêntificador único'
            opt2='O atributo Class só pode ser usado em um único Elemento'
            opt3='Id é usada como um idêntificador múltiplo'
            opt4='Id só pode ser usado mais de uma vez ao ser usado com nomes diferentes'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Indent4"
        />
    )
}

export function Indent4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="25"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Um mesmo elemento pode possuir mais de um atributo" //Opcional
            //PERGUNTA
            pergunta='Qual dessas opções mostra respectivamente o uso de um idêntificador único e um múltiplo?'
            opt1='<div class="divs" id="Elemento1"> </div>'
            opt2='<div id="Elemento1" class="divs"> </div>'
            opt3='<img id="imagem1"/>'
            opt4='<img class="imagens"/>'
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Indent5"
        />
    )
}

export function Indent5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="84%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="30"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Codifique uma div com um idêntificador único com o nome de div1"
            txtantes="<div"
            txtdepois="></h1>"
            txtCerto1='Id="div1"'
            txtCerto2='Id="DIV1"'
            txtCerto3='Id="Div1"'
            tamanhoInput="86%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Indent6"
        />
    )
}

export function Indent6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="25"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="É possível adicionar mais de uma class em um elemento." //Opcional
            //PERGUNTA
            pergunta='Escolha a opção que representa 2 class distintas em um mesmo elemento.'
            opt1='<div class="divs" class="classe1"> </div>'
            opt2='<div class="Elemento1"> </div>'
            opt3='<img class="imagens classe1"/>'
            opt4='<img id="imagem1"/>'
            optCerta="opt3"
            aulaSalvar="IDENTIFICANDOELEMENTOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}



