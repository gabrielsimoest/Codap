import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../components/Shared/TeoricView';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function Comentario({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.basic.comments.Comentario_mainText")}
            secondText={t("html.basic.comments.Comentario_secondText")}
            thirdText="none"
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
  <html>
    <body>

        <h1>Lorem Ipsum</h1>

        <!---Comment--->
        <p>Lorem Ipsum</p>
        <!---<p>Lorem Ipsum</p>--->

    </body>
  </html>`} 
            endText={t("html.basic.comments.Comentario_endText")}
            navegar="ComentarioEx1"
            highlight={["comment", "comentário", "HTML"]}
        />
    )
}

export function ComentarioEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.comments.ComentarioEx1_pergunta")}
            opt1={t("html.basic.comments.ComentarioEx1_opt1")}
            opt2={t("html.basic.comments.ComentarioEx1_opt2")}
            opt3={t("html.basic.comments.ComentarioEx1_opt3")}
            opt4={t("html.basic.comments.ComentarioEx1_opt4")}
            opt5={t("html.basic.comments.ComentarioEx1_opt5")}
            opt6={t("html.basic.comments.ComentarioEx1_opt6")}
            opt7="none"
            opt8="none"
            txtCerto={t("html.basic.comments.ComentarioEx1_txtCerto")}
            navegar="ComentarioEx2"
            txtToHighlight={["comentário", "comment"]}
        />
    )
}

export function ComentarioEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            adicionaltxt={t("html.basic.comments.ComentarioEx2_adicionaltxt")}
            pergunta={t("html.basic.comments.ComentarioEx2_pergunta")}
            txtantes={t("html.basic.comments.ComentarioEx2_txtantes")}
            txtdepois={t("html.basic.comments.ComentarioEx2_txtdepois")}
            txtCerto1={t("html.basic.comments.ComentarioEx2_txtCerto1")}
            txtCerto2={t("html.basic.comments.ComentarioEx2_txtCerto2")}
            txtCerto3={t("html.basic.comments.ComentarioEx2_txtCerto3")}
            tamanhoInput="75%"
            txtToHighlight={["outros elementos", "elements"]}
            navegar="ComentarioEx3"
        />
    )
}

export function ComentarioEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.comments.ComentarioEx3_pergunta")}
            txtantes={t("html.basic.comments.ComentarioEx3_txtantes")}
            txtdepois={t("html.basic.comments.ComentarioEx3_txtdepois")}
            txtCerto1={t("html.basic.comments.ComentarioEx3_txtCerto1")}
            txtCerto2={t("html.basic.comments.ComentarioEx3_txtCerto2")}
            txtCerto3={t("html.basic.comments.ComentarioEx3_txtCerto3")}
            tamanhoInput="75%"
            txtToHighlight={["HELLO WORLD"]}
            navegar="ComentarioEx4"
        />
    )
}

export function ComentarioEx4({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.comments.ComentarioEx4_pergunta")}
            opt1={t("html.basic.comments.ComentarioEx4_opt1")}
            opt2={t("html.basic.comments.ComentarioEx4_opt2")}
            opt3={t("html.basic.comments.ComentarioEx4_opt3")}
            opt4={t("html.basic.comments.ComentarioEx4_opt4")}
            optCerta="opt3"
            navegar="ComentarioEx5"
        />
    )
}

export function ComentarioEx5({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.comments.ComentarioEx5_pergunta")}
            opt1={t("html.basic.comments.ComentarioEx5_opt1")}
            opt2={t("html.basic.comments.ComentarioEx5_opt2")}
            opt3={t("html.basic.comments.ComentarioEx5_opt3")}
            opt4={t("html.basic.comments.ComentarioEx5_opt4")}
            optCerta="opt1"
            navegar="ComentarioEx6"
        />
    )
}

export function ComentarioEx6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.comments.ComentarioEx6_pergunta")}
            txtantes={t("html.basic.comments.ComentarioEx6_txtantes")}
            txtdepois={t("html.basic.comments.ComentarioEx6_txtdepois")}
            txtCerto1={t("html.basic.comments.ComentarioEx6_txtCerto1")}
            txtCerto2={t("html.basic.comments.ComentarioEx6_txtCerto2")}
            txtCerto3={t("html.basic.comments.ComentarioEx6_txtCerto3")}
            tamanhoInput="80%"
            aulaSalvar={11}
            Salvar={true}
            txtToHighlight={["comentário", "comment", "CODAP"]}
            navegar="CongratsView"
        />
    )
}




