import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';
import NestingView from '../../../Helpers/NestingView';

export function Comentario({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Vamos colocar um comentário no seu documento HTML?"
            //Textos opcionais
            adicionaltxt="Os comentários servem para facilitar a visualização do que os elementos estão fazendo em seu projeto, facilitando a manutenção e entendimento o mesmo."
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/H1to6.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/H1to6_2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Veja que eles não são visíveis no seu site."
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComentarioEx1"
        />
    )
}

export function ComentarioEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none" //Opcional
            pergunta="Faça um comentário:"
            opt1="<"
            opt2='>'
            opt3="!"
            opt4="--"
            opt5="CODAP" //Opcional
            opt6="--" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<!--CODAP-->"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComentarioEx2"
        />
    )
}

export function ComentarioEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Você pode colocar inclusive elementos no comentário, mas é claro que eles não serão mostrados." //Opcional
            //PERGUNTA
            pergunta='Transforme <p>CODAP</p> em um comentário:'
            txtantes="<!--"
            txtdepois="-->"
            txtCerto1='<p>CODAP</p>'
            txtCerto2='<p>Codap</p>'
            txtCerto3='<p>codap</p>'
            tamanhoInput="75%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="ComentarioEx3"
        />
    )
}

export function ComentarioEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Escreva HELLO WORLD no comentário:'
            txtantes="<!-- "
            txtdepois="-->"
            txtCerto1='HELLO WORLD'
            txtCerto2='Hello world'
            txtCerto3='hello world'
            tamanhoInput="75%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="ComentarioEx4"
        />
    )
}

export function ComentarioEx4({ navigation }) {
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
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Como se cria um comentário?"
            opt1="/comment: 'CODAP'"
            opt2="//CODAP"
            opt3="<!--CODAP-->"
            opt4="<<<CODAP>>>"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComentarioEx5"
        />
    )
}

export function ComentarioEx5({ navigation }) {
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
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="O que pode estar dentro do comentário?"
            opt1="Qualquer coisa"
            opt2="Apenas elementos de texto"
            opt3="Apenas textos puros"
            opt4="Qualquer elemento <h*>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ComentarioEx6"
        />
    )
}

export function ComentarioEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Usando o que aprendeu, escreva um comentário escrito CODAP:'
            txtantes="< "
            txtdepois=">"
            txtCerto1='!--CODAP--'
            txtCerto2='!--Codap--'
            txtCerto3='!--codap--'
            tamanhoInput="80%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




