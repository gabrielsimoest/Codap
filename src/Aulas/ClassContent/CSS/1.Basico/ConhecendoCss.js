import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function ConhecendoCSS({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="0%"
            //Texto principal
            txt="Olá, aqui é o NOME, vamos aprender CSS? O CSS é um mecanismo para adicionar estilos a um documento web."
            //Textos opcionais
            adicionaltxt=" O código CSS pode ser aplicado diretamente nas tags html ou ficar contido dentro das tags <style> "
            adicionaltxt2="none"
            //Imagem principal
            img="none"
            //Imagens opcionais
            opt_img="none"
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="O 'p' dentro do <style> no exemplo é um seletor, isso representa que todos os elementos com o mesmo nome do seletor receberão aquele estilo. "
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CSSEx1"
        />
    )
}

export function CSSEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="33%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual a função do CSS?"
            opt1="Adicionar estilos"
            opt2="Adicionar novas mecânicas"
            opt3='Adicionar notificações'
            opt4="Adicionar traduções "
            optCerta="opt1"
            navegar="CSSEx2"
        />
    )
}

export function CSSEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="66%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="O que o seletor h1 indica?"
            opt1="Indica que todo elemento h1 será excluido"
            opt2="Indica que todo elemento h1 substituido por h2"
            opt3='Indica que todo elemento h1 obterá os estilos'
            opt4="Indica que todo elemento h1 será executado como JS"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="CSSEx3"
        />
    )
}

export function CSSEx3({ navigation }) {
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
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Crie um estilo de cor azul para o h1"
            opt1='<h1 '
            opt2='style='
            opt3='"color:blue"'
            opt4='>'
            opt5='CODAP'
            opt6='</h1>'
            opt7='none'
            opt8='none'
            txtCerto='<h1 style="color:blue">CODAP</h1>'
            Salvar={"true"}
            aulaSalvar="CONHECENDOCSS"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}





