import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Links({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="14%"
            //Texto principal
            mainText="Vamos fazer um site dinâmico utilizando os links?"
            //Textos opcionais
            secondText="Para fazer isso você precisará definir um atributo de referência para o link e um id para o elemento que deseja navegar."
            thirdText="Você pode criar links usando a tag <a> tanto para redirecionar para elementos usando o ID do elemento ou para outros sites usando a url."
            //Textos final opcional (aparece após as imagens)
            endText="Como viu nesse exemplo, ao clicar no link você é redirecionado para o elemento com aquela ID do link."
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
    <html>
        <body>
            
            <p><a href="#section1">Ir para a Seção 1</a></p>
            <p><a href="#section2">Ir para a Seção 2</a></p>

            <h1 id="section1">Seção 1</h1>
            <h2>Este é o conteúdo da Seção 1.</h2>
            
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
            </p>

            <h1 id="section2">Seção 2</h1>
            <h2>Este é o conteúdo da Seção 2.</h2>
            
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc et elementum cursus, sem diam aliquet nisl, in faucibus mi nisl a ligula. Sed auctor, nisl id congue porta, erat orci efficitur diam, non finibus sem nisl a ligula.
            </p>
            
        </body>
    </html>`}
            //NOME ADICIONADO NO STACK NAVIGATOR
            highlight={["link", "links"]}
            navegar="LinksEx1"
        />
    )
}

export function LinksEx1({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="28%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Vamos criar um link!" //Opcional
            //PERGUNTA
            pergunta='Primeiramente adicione o atributo href="#codap" como referência do link, não esqueça as áspas!'
            txtantes="<a "
            txtdepois=">CODAP</a>"
            txtCerto1='href="#CODAP"'
            txtCerto2='href="#Codap"'
            txtCerto3='href="#codap"'
            tamanhoInput="50%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx2"
        />
    )
}

export function LinksEx2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="42%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Agora vamos transformar outro elemento em link (usaremos o <h3> como exemplo). Siga o exemplo abaixo para criar um link com o nome de CODAP e href="#codap".'
            //pergunta/texto principal
            pergunta='<h3><a href="#REF">NOME DO LINK</a></h3>'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<main>" //Abertura primeiro elemento
            txtdepois="</main>" //Fechamento primeiro elemento
            //txtantes2="" //Abertura segundo elemento
            //txtdepois2="" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<h3><a href="#codap">CODAP</a></h3>' //Primeira opção certa
            //txtCerto2="" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="80%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="LinksEx3"
        />
    )
}

export function LinksEx3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="56%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={2}
            //Texto adicional
            adicionaltxt='Agora que você aprendeu a fazer um link, vamos fazer uma lista não ordenada de links usando <li> no lugar de <h3>.'
            //pergunta/texto principal
            pergunta='A lista deve ter 1 item com nome de CODAP e href="#codap"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<main>" //Abertura primeiro elemento
            txtdepois="</main>" //Fechamento primeiro elemento
            txtantes2="<ul>" //Abertura segundo elemento
            txtdepois2="</ul>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Fechamento terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<li><a href="#codap">CODAP</a></li>' //Primeira opção certa
            //txtCerto2="" //Segunda opção certa
            //txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="75%"
            //NOME ADICIONADO NO STACK NAVIGATOR 
            navegar="LinksEx4"
        />
    )
}

export function LinksEx4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="70%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta='Agora crie um elemento <h1> com o atributo id="codap" para atribuir ao link criado anteriomente (o id precisa ser idêntico ao href).'
            txtantes="<h1"
            txtdepois=">CODAP</h1>"
            txtCerto1='id="CODAP"'
            txtCerto2='id="Codap"'
            txtCerto3='id="codap"'
            tamanhoInput="40%"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx5"
        />
    )
}

export function LinksEx5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="84%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="Como mencionado anteriormente, você pode crirar links para outros sites." //Opcional
            //PERGUNTA
            pergunta="Como poderia ser um link para o o Google?"
            opt1="<h3 LINK: >'https://www.google.com'</h3>"
            opt2="<p><a href='https://www.google.com'>Google</a></p>"
            opt3="<li>'https://www.google.com'</li>"
            opt4="<link>'https://www.google.com'</link>"
            optCerta="opt2"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="LinksEx6"
        />
    )
}

export function LinksEx6({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="95%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="9999"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual das opções está criando um link para o ID codap?"
            opt1="<h3><a href=codap>CODAP</a></h3>"
            opt2="<h3><a href=#codap>CODAP</a></h3>"
            opt3='<h3><a href="#codap">CODAP</a></h3>'
            opt4="<h3><a href=>#codap>CODAP</a></h3>"
            optCerta="opt3"
            aulaSalvar={14}
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}




