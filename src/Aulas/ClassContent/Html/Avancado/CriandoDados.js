import React from 'react';
import { useTranslation } from 'react-i18next';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import NestingView from '../../../../components/Shared/NestingView';

export function CriandoDados({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="20%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={3}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt="Adicione uma linha com um Título na tabela."
            //pergunta/texto principal
            pergunta='O Título deve conter o valor "Nome"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Table>" //Abertura primeiro elemento
            txtdepois="</Table>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<tr>" //Primeira opção certa
            txtCerto2="<th>Nome</th>" //Segunda opção certa
            txtCerto3="</tr>" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CriandoDados2"
        />
    )
}

export function CriandoDados2({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="40%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            adicionaltxt="none" //Opcional
            pergunta='Codifique uma linha que tenha o valor de Titulo igual à "Nome" "Idade"'
            opt1="<tr>"
            opt2='</th>'
            opt3="<th>"
            opt4="Nome"
            opt5="</th>" //Opcional
            opt6="<th>" //Opcional
            opt7="Idade" //Opcional
            opt8="</tr>" //Opcional
            //TEXTO RESPOSTA
            txtCerto="<tr><th>Nome</th><th>Idade</th></tr>"
            aulaSalvar="none"
            navegar="CriandoDados3"
        />
    )
}

export function CriandoDados3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="60%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="60"
            //Quantidade de opções (1-3)
            qtdop={2}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt="Adicione duas Células na tabela."
            //pergunta/texto principal
            pergunta='As Células devem conter os valores "Rob" "17 anos"'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Table>" //Abertura primeiro elemento
            txtdepois="</Table>" //Fechamento primeiro elemento
            txtantes2="<tr>" //Abertura segundo elemento
            txtdepois2="</tr>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1="<td>Rob</td>" //Primeira opção certa
            txtCerto2="<td>17 anos</td>" //Segunda opção certa
            txtCerto3="" //terceira opção certa

            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CriandoDados4"
        />
    )
}

export function CriandoDados4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="80%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Qual é uma célula da Tabela?"
            opt1="<td>texto</td>"
            opt2="<th>texto</th>"
            opt3="<Table>texto</Table>"
            opt4="<col>texto</col>"
            optCerta="opt1"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CriandoDados5"
        />
    )
}

export function CriandoDados5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="90%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="20"
            //TEXTO ADICIONAL CABEÇARIO
            adicionaltxt="none" //Opcional
            //PERGUNTA
            pergunta="Para que serve o Elemente <th>?"
            opt1="Para Criar uma Célula na Tabela"
            opt2="Para Criar um Título na Tabela"
            opt3="Para iniciar uma Tabela"
            opt4="Para definir uma linha"
            optCerta="opt2"
            aulaSalvar={20}
            Salvar={true}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="CongratsView"
        />
    )
}



