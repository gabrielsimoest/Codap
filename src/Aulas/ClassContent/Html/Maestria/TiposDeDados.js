import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import OptionView from '../../../../components/Shared/OptionView';
import NestingView from '../../../../components/Shared/NestingView';

export function TiposDeDados({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TeoricView
            navigation={navigation}
            //BARRA DE PROGRESSO
            progresso="16%"
            //Texto principal
            txt="Existem varios tipos de Dados para um input, aqui estão algum deles"
            //Textos opcionais
            adicionaltxt="checkbox: Uma caixa de marcação                                               email: Um campo para editar um endereço de e-mail.                                   file: Um controle que permite ao usuário selecionar um arquivo.                                                                      hidden: Um controle que não é exibido mas cujo valor é enviado ao servidor."
            adicionaltxt2="none"
            //Imagem principal
            img='none'
            //Imagens opcionais
            opt_img='none'
            opt_img2="none"
            //Textos final opcional (aparece após as imagens)
            adicionaltxt_end="none"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TiposDeDados2"
        />
    )
}

export function TiposDeDados2({ navigation }) {
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
            pergunta="Qual Tipo deve ser usado para esconder um <input>?"
            opt1="checkbox"
            opt2="file"
            opt3="hidden"
            opt4="text"
            optCerta="opt3"
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="TiposDeDados3"
        />
    )
}

export function TiposDeDados3({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="64%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='Dica: Todos os tipos devem ser escritos em minúsculo'
            //pergunta/texto principal
            pergunta='Crie um <input> para um Email'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<input type="email">' //Primeira opção certa
            txtCerto2='<input type="email">' //Segunda opção certa
            txtCerto3='<input type="email">' //terceira opção certa
            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="TiposDeDados4"
        />
    )
}

export function TiposDeDados4({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="76%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Crie um <input> para um Arquivo'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<input type="file">' //Primeira opção certa
            txtCerto2='<input type="file">' //Segunda opção certa
            txtCerto3='<input type="file">' //terceira opção certa
            //Tamanho do input
            tamanhoInput="46%"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="TiposDeDados5"
        />
    )
}

export function TiposDeDados5({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="90%"
            //SEGUNDOS NO CRONOMETRO // OPCIONAL == 9999
            sec="40"
            //Quantidade de opções (1-3)
            qtdop={1}
            //Nível de aninhamento (1-3)
            layer={1}
            //Texto adicional
            adicionaltxt='none'
            //pergunta/texto principal
            pergunta='Crie um <input> para uma Caixa de Seleção'
            //Elementos da estrutura (1-3) de acordo com as layers
            txtantes="<Body>" //Abertura primeiro elemento
            txtdepois="</Body>" //Fechamento primeiro elemento
            //txtantes2="<th>" //Abertura segundo elemento
            //txtdepois2="</th>" //Fechamento segundo elemento
            //txtantes3="" //Abertura terceiro elemento
            //txtdepois3="" //Abertura terceiro elemento

            //Resposta (1-3) de acordo com a quantidade de opções
            txtCerto1='<input type="checkbox">' //Primeira opção certa
            txtCerto2='<input type="checkbox">' //Segunda opção certa
            txtCerto3='<input type="checkbox">' //terceira opção certa
            //Tamanho do input
            tamanhoInput="46%"
            aulaSalvar="TIPOSDEDADOS"
            Salvar="true"
            //NOME ADICIONADO NO STACK NAVIGATOR  
            navegar="CongratsView"
        />
    )
}