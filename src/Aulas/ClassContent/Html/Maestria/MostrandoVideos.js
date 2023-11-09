import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';

export function MostrandoVideos({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="O elemento HTML <iframe> (ou elemento HTML inline frame) representa um contexto de navegação aninhado, efetivamente incorporando outra página HTML para a página atual."
            //Textos opcionais
            adicionaltxt="Já o elemento HTML <embed> incorpora conteúdo externo no ponto especificado no documento. Este conteúdo é fornecido por um aplicativo externo ou outra fonte de conteúdo interativo, como um plug-in de navegador."
            adicionaltxt2="Eles geralmente são utilizados para incorporar videos de outros sites ou aplicativos"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="MostrandoVideos2"
        />
    )
}

export function MostrandoVideos2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="32%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Como é feito um iframe?"
            opt1='<iframe src="page.html"></iframe>'
            opt2='<iframe src="page.html">'
            opt3='</iframe">'
            opt4="<video></video>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="MostrandoVideos3"
        />
    )
}

export function MostrandoVideos3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="32%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="15"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Como é feito um embed?"
            opt1='<embed src="page.html"></embed>'
            opt2='</embed src="page.html">'
            opt3='<embed></embed>'
            opt4='<embed src="./media/cc0-videos/flower.mp4">'
            optCerta="opt4"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="MostrandoVideos4"
        />
    )
}

export function MostrandoVideos4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="64%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt=''
            //pergunta/texto principal
            pergunta='Crie um <iframe> que tenha um src com valor "./page.html"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<iframe src="./page.html"></iframe>' //Primeira opção certa
            txtCerto2='<iframe src="./page.html"></iframe>' //Segunda opção certa
            txtCerto3='<iframe src="./page.html"></iframe>' //terceira opção certa
            //Tamanho do input
            tamanhoInput="70%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="MostrandoVideos5"
        />
    )
}

export function MostrandoVideos5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="76%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Crie um <embed> que tenha como src o valor "./codap.mp4"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<embed src="./codap.mp4">' //Primeira opção certa
            txtCerto2='<embed src="./codap.mp4">' //Segunda opção certa
            txtCerto3='<embed src="./codap.mp4">' //terceira opção certa
            //Tamanho do input
            tamanhoInput="70%"
            aulaSalvar="MOSTRANDOVIDEOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}
