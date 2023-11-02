import React from 'react';
import { useTranslation } from 'react-i18next';
import TeoricView from '../../../../Helpers/TeoricView';
import TheoryView from '../../../../Helpers/TheoryView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';
import NestingView from '../../../../Helpers/NestingView';

export function Comentario({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("Comentario_mainText")}
            secondText={t("Comentario_secondText")}
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
            endText={t("Comentario_endText")}
            navegar="ComentarioEx1"
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
            pergunta={t("ComentarioEx1_pergunta")}
            opt1={t("ComentarioEx1_opt1")}
            opt2={t("ComentarioEx1_opt2")}
            opt3={t("ComentarioEx1_opt3")}
            opt4={t("ComentarioEx1_opt4")}
            opt5={t("ComentarioEx1_opt5")}
            opt6={t("ComentarioEx1_opt6")}
            opt7="none"
            opt8="none"
            txtCerto={t("ComentarioEx1_txtCerto")}
            navegar="ComentarioEx2"
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
            adicionaltxt={t("ComentarioEx2_adicionaltxt")}
            pergunta={t("ComentarioEx2_pergunta")}
            txtantes={t("ComentarioEx2_txtantes")}
            txtdepois={t("ComentarioEx2_txtdepois")}
            txtCerto1={t("ComentarioEx2_txtCerto1")}
            txtCerto2={t("ComentarioEx2_txtCerto2")}
            txtCerto3={t("ComentarioEx2_txtCerto3")}
            tamanhoInput="75%"
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
            pergunta={t("ComentarioEx3_pergunta")}
            txtantes={t("ComentarioEx3_txtantes")}
            txtdepois={t("ComentarioEx3_txtdepois")}
            txtCerto1={t("ComentarioEx3_txtCerto1")}
            txtCerto2={t("ComentarioEx3_txtCerto2")}
            txtCerto3={t("ComentarioEx3_txtCerto3")}
            tamanhoInput="75%"
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
            pergunta={t("ComentarioEx4_pergunta")}
            opt1={t("ComentarioEx4_opt1")}
            opt2={t("ComentarioEx4_opt2")}
            opt3={t("ComentarioEx4_opt3")}
            opt4={t("ComentarioEx4_opt4")}
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
            pergunta={t("ComentarioEx5_pergunta")}
            opt1={t("ComentarioEx5_opt1")}
            opt2={t("ComentarioEx5_opt2")}
            opt3={t("ComentarioEx5_opt3")}
            opt4={t("ComentarioEx5_opt4")}
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
            pergunta={t("ComentarioEx6_pergunta")}
            txtantes={t("ComentarioEx6_txtantes")}
            txtdepois={t("ComentarioEx6_txtdepois")}
            txtCerto1={t("ComentarioEx6_txtCerto1")}
            txtCerto2={t("ComentarioEx6_txtCerto2")}
            txtCerto3={t("ComentarioEx6_txtCerto3")}
            tamanhoInput="80%"
            aulaSalvar="ADICIONANDOCOMENTARIOS"
            Salvar="true"
            navegar="CongratsView"
        />
    )
}



