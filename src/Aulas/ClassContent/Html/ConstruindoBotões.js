import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function ButtonHtml({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Botões são elementos interativos usados para várias funções."
            //Textos opcionais
            adicionaltxt="Para criar seu botão, basta escrever <button>texto</button>"
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/Button.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/Button2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ButtonEx1"
        />
    )
}

export function ButtonEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none" //Opcional
            pergunta="Codifique um botão escrito CODAP"
            opt1="CODAP"
            opt2='<h3>'
            opt3="<button>"
            opt4="</button>"
            opt5="TEXTO" //Opcional
            opt6="</h3>" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<button>CODAP</button>"
            navegar="ButtonEx2"
        />
    )
}

export function ButtonEx2({ navigation }) {
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
            adicionaltxt="O que vai aparecer com o código abaixo?" //Opcional
            //PERGUNTA
            pergunta="<button>CODAP</button>"
            opt1="Um título escrito CODAP"
            opt2="Nada, pois a tag está errada"
            opt3="Um botão escrito CODAP"
            opt4="Vai aparecer <button>CODAP</button>"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ButtonEx3"
        />
    )
}

export function ButtonEx3({ navigation }) {
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
            pergunta="Codifique um botão escrito CODAP"
            txtantes="<button>"
            txtdepois="</button>"
            txtCerto1="CODAP"
            txtCerto2="codap"
            txtCerto3="Codap"
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ButtonEx4"
        />
    )
}

export function ButtonEx4({ navigation }) {
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
            pergunta="Codifique um botão escrito CODAP"
            txtantes="<"
            txtdepois=">"
            txtCerto1="button>CODAP</button"
            txtCerto2="button>codap</button"
            txtCerto3="button>Codap</button"
            tamanhoInput="60%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ButtonEx5"
        />
    )
}

export function ButtonEx5({ navigation }) {
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
            pergunta="Qual das opções está correta?"
            opt1="<button>texto</button>"
            opt2="<button = texto/>"
            opt3="<button>texto<button>"
            opt4="button{texto}"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="ButtonEx6"
        />
    )
}

export function ButtonEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none" //Opcional
            pergunta="Codifique um botão escrito LOGIN"
            opt1="LOGIN"
            opt2='<'
            opt3="button"
            opt4="<"
            opt5="/button" //Opcional
            opt6=">" //Opcional
            opt7=">" //Opcional
            opt8="EXIT" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<button>LOGIN</button>"
            aulaSalvar="CONSTRUINDOBOTOES"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




