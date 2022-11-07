import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';

export function Estrutura({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="50%"
            //Texto principal
            txt="Olá, aqui é o NOME. Vamos aprender HTML? O HTML é uma linguagem de marcação muito utilizada na construção de páginas na Web."
            //Textos opcionais
            adicionaltxt="Primeiramente estarei mostrando um exemplo bem básico de estrutura para você já ir tendo uma ideia de como o HTML se parece."
            adicionaltxt2="none"
            //Imagem principal
            img={require("../../../../assets/Estrutura.png")}
            //Imagens opcionais
            opt_img={require("../../../../assets/Estrutura2.png")}
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Como você pôde ver ela é bem simples, mas existem vários outros elementos que podem ser adicionados nessa estrutura para termos sites incríveis."
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TagsElementos"
        />
    )
}

export function TagsElements({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="100%"
            //Texto principal
            txt="Agora que vimos a estrutura, vamos entender melhor o que está nela."
            //Textos opcionais
            adicionaltxt="A estrutura é formada por tags de abertura e fechamento, que são indicadas por essas setas <>. Dentro delas vai o nome do elemento."
            adicionaltxt2="none"
            adicionaltxt3="none"
            //Imagem principal
            img={require("../../../../assets/Estrutura.png")}
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="Lembre-se, a estrutura DEVE estar entre as tags <html> </html>. Se não seu site não vai funcionar!"
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HtmlStartEx1"
        />
    )
}
export function HtmlStartEx1({ navigation }) {
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
            adicionaltxt="A maioria das tags possuem uma abertura e um fechamento. Entre elas fica o conteúdo." //Opcional
            //PERGUNTA
            pergunta="<html> representa uma tag de abertura, como seria uma tag de fechamento?"
            opt1="<html>"
            opt2="<end html>"
            opt3=">html<"
            opt4="</html>"
            optCerta="opt4"
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HtmlStartEx2"
        />
    )
}
export function HtmlStartEx2({ navigation }) {
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
            adicionaltxt="Qual é o nome do elemento do código a seguir?" //Opcional
            //PERGUNTA
            pergunta="<h1>CODAP</h1>"
            opt1="<>"
            opt2="CODAP"
            opt3="h1"
            opt4="</>"
            optCerta="opt3"
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HtmlStartEx3"
        />
    )
}
export function HtmlStartEx3({ navigation }) {
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
            pergunta="O que indica uma tag?"
            opt1="< >"
            opt2="//"
            opt3="TAG="
            opt4="{ }"
            optCerta="opt1"
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HtmlStartEx4"
        />
    )
}
export function HtmlStartEx4({ navigation }) {
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
            pergunta="Qual das opções está certa?"
            opt1="'h1'texto'/h1'"
            opt2="|h1|texto|/h1|"
            opt3="h1 texto /h1"
            opt4="<h1>texto</h1>"
            optCerta="opt4"
            aulaSalvar="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="HtmlStartEx5"
        />
    )
}
export function HtmlStartEx5({ navigation }) {
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
            pergunta="O que acontece se você não colocar a tag <html> no início e no fim do projeto?"
            opt1="O site não funciona"
            opt2="O site funciona, mas com algumas limitações"
            opt3="O site funciona normalmente"
            opt4="O site fica com o desempenho melhorado"
            optCerta="opt1"
            aulaSalvar="HTMLETAGS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}