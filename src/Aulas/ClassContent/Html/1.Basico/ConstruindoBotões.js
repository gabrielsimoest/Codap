import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../Helpers/TheoryView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';

export function ButtonHtml({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("ButtonHtml_txt")}
            secondText={t("ButtonHtml_adicionaltxt")}
            thirdText="none"
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
  <html>
    <body>
      <h1>Lorem Ipsum</h1>

      <p>Lorem Ipsum</p>
      <button>Lorem Ipsum</button>

    </body>
  </html>`}
            highlight={["button"]}
            endText="none"
            navegar="ButtonEx1"
        />
    )
}

export function ButtonEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("ButtonEx1_pergunta")}
            opt1={t("ButtonEx1_opt1")}
            opt2={t("ButtonEx1_opt2")}
            opt3={t("ButtonEx1_opt3")}
            opt4={t("ButtonEx1_opt4")}
            opt5="none"
            opt6="none"
            opt7="none"
            opt8="none"
            txtCerto={t("ButtonEx1_txtCerto")}
            navegar="ButtonEx2"
        />
    )
}

export function ButtonEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            adicionaltxt={t("ButtonEx2_adicionaltxt")}
            pergunta={t("ButtonEx2_pergunta")}
            opt1={t("ButtonEx2_opt1")}
            opt2={t("ButtonEx2_opt2")}
            opt3={t("ButtonEx2_opt3")}
            opt4={t("ButtonEx2_opt4")}
            optCerta="opt3"
            navegar="ButtonEx3"
        />
    )
}

export function ButtonEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("ButtonEx3_pergunta")}
            txtantes={t("ButtonEx3_txtantes")}
            txtdepois={t("ButtonEx3_txtdepois")}
            txtCerto1={t("ButtonEx3_txtCerto1")}
            txtCerto2={t("ButtonEx3_txtCerto2")}
            txtCerto3={t("ButtonEx3_txtCerto3")}
            tamanhoInput="46%"
            navegar="ButtonEx4"
        />
    )
}

export function ButtonEx4({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("ButtonEx4_pergunta")}
            txtantes={t("ButtonEx4_txtantes")}
            txtdepois={t("ButtonEx4_txtdepois")}
            txtCerto1={t("ButtonEx4_txtCerto1")}
            txtCerto2={t("ButtonEx4_txtCerto2")}
            txtCerto3={t("ButtonEx4_txtCerto3")}
            tamanhoInput="60%"
            navegar="ButtonEx5"
        />
    )
}

export function ButtonEx5({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("ButtonEx5_pergunta")}
            opt1={t("ButtonEx5_opt1")}
            opt2={t("ButtonEx5_opt2")}
            opt3={t("ButtonEx5_opt3")}
            opt4={t("ButtonEx5_opt4")}
            optCerta="opt1"
            navegar="ButtonEx6"
        />
    )
}

export function ButtonEx6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="96%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("ButtonEx6_pergunta")}
            opt1={t("ButtonEx6_opt1")}
            opt2={t("ButtonEx6_opt2")}
            opt3={t("ButtonEx6_opt3")}
            opt4={t("ButtonEx6_opt4")}
            opt5={t("ButtonEx6_opt5")}
            opt6={t("ButtonEx6_opt6")}
            opt7={t("ButtonEx6_opt7")}
            opt8={t("ButtonEx6_opt8")}
            txtCerto={t("ButtonEx6_txtCerto")}
            aulaSalvar="CONSTRUINDOBOTOES"
            Salvar="true"
            navegar="CongratsView"
        />
    )
}




