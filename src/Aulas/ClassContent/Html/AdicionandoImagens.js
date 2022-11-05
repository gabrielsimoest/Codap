import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../Helpers/TeoricView';
import OptionView from '../../../Helpers/OptionView';
import SelectView from '../../../Helpers/SelectView';
import TextView from '../../../Helpers/TextView';

export function ImgTeoric({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Existem elementos que podem fechar na mesma tag, mas eles precisam de atributos junto com o nome para funcionar corretamente."
            //Textos opcionais
            adicionaltxt="O elemento <img/> precisa de um atributo 'src' contendo um link para  mostrar a imagem."
            adicionaltxt2='<img src="link"/>'
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Img1"
        />
    )
}

export function Img1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none"
            pergunta="Crie um elemento imagem com as opções a seguir:"
            opt1="<"
            opt2='img '
            opt3="/>"
            opt4="src="
            opt5='"https://LINK"'  //Opcional
            opt6="none" //Opcional
            opt7="none" //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<img src="https://LINK"/>'
            navegar="Img2"
        />
    )
}

export function Img2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="Você pode adicionar atributos para aumentar ou diminuir a altura e a largura da imagem de maneira proporcional."
            pergunta="Crie um elemento imagem que ajuste a altura usando o atributo 'height':"
            opt1="<"
            opt2='img'
            opt3="/>"
            opt4=" src="
            opt5='"https://LINK"'  //Opcional
            opt6=" height=" //Opcional
            opt7='"30"' //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<img src="https://LINK" height="30"/>'
            navegar="Img3"
        />
    )
}

export function Img3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="0%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            adicionaltxt="none"
            pergunta="Agora crie um elemento imagem que ajuste a largura usando o atributo 'width':"
            opt1="<"
            opt2='img'
            opt3="/>"
            opt4=" src="
            opt5='"https://LINK"'  //Opcional
            opt6=" width=" //Opcional
            opt7='"60"' //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<img src="https://LINK" width="60"/>'
            navegar="Img4"
        />
    )
}

export function Img4({ navigation }) {
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
            adicionaltxt="Você pode ajustar os dois lados manualmente, mas perde a proporção da imagem." //Opcional
            //PERGUNTA
            pergunta="Ajuste para 50 pixels de altura e 30 pixels de largura."
            opt1="<"
            opt2='img'
            opt3="/>"
            opt4=" src="
            opt5='"https://LINK"'  //Opcional
            opt6=' width="30"' //Opcional
            opt7=' height="50"' //Opcional
            opt8="none" //Opcional
            //TEXTO RESPOSTA
            txtCerto='<img src="https://LINK" height="50" width="30"/>'
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Img5"
        />
    )
}

export function Img5({ navigation }) {
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
            adicionaltxt="O que vai aparecer com o código a seguir?" //Opcional
            //PERGUNTA
            pergunta='<img src="https://LINK" width="30"/>'
            opt1="https://LINK"
            opt2="Imagem de 30 pixels de largura"
            opt3='<img src="https://LINK" width="30"/>'
            opt4="Imagem de 30 pixels de altura"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Img6"
        />
    )
}

export function Img6({ navigation }) {
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
            pergunta='Qual dessas opções mostra o uso correto do elemento <img/>?'
            opt1='<img src=https://LINK/>'
            opt2='<img/>>> src="https://LINK"'
            opt3='<img>src="https://LINK"</img>'
            opt4='<img src="https://LINK"/>'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




