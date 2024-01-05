import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';

export function ButtonHtml({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.basic.buttons.ButtonHtml_txt")}
            secondText={t("html.basic.buttons.ButtonHtml_adicionaltxt")}
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
            pergunta={t("html.basic.buttons.ButtonEx1_pergunta")}
            opt1={t("html.basic.buttons.ButtonEx1_opt1")}
            opt2={t("html.basic.buttons.ButtonEx1_opt2")}
            opt3={t("html.basic.buttons.ButtonEx1_opt3")}
            opt4={t("html.basic.buttons.ButtonEx1_opt4")}
            opt5="none"
            opt6="none"
            opt7="none"
            opt8="none"
            txtCerto={t("html.basic.buttons.ButtonEx1_txtCerto")}
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
            adicionaltxt={t("html.basic.buttons.ButtonEx2_adicionaltxt")}
            pergunta={t("html.basic.buttons.ButtonEx2_pergunta")}
            opt1={t("html.basic.buttons.ButtonEx2_opt1")}
            opt2={t("html.basic.buttons.ButtonEx2_opt2")}
            opt3={t("html.basic.buttons.ButtonEx2_opt3")}
            opt4={t("html.basic.buttons.ButtonEx2_opt4")}
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
            pergunta={t("html.basic.buttons.ButtonEx3_pergunta")}
            txtantes={t("html.basic.buttons.ButtonEx3_txtantes")}
            txtdepois={t("html.basic.buttons.ButtonEx3_txtdepois")}
            txtCerto1={t("html.basic.buttons.ButtonEx3_txtCerto1")}
            txtCerto2={t("html.basic.buttons.ButtonEx3_txtCerto2")}
            txtCerto3={t("html.basic.buttons.ButtonEx3_txtCerto3")}
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
            pergunta={t("html.basic.buttons.ButtonEx4_pergunta")}
            txtantes={t("html.basic.buttons.ButtonEx4_txtantes")}
            txtdepois={t("html.basic.buttons.ButtonEx4_txtdepois")}
            txtCerto1={t("html.basic.buttons.ButtonEx4_txtCerto1")}
            txtCerto2={t("html.basic.buttons.ButtonEx4_txtCerto2")}
            txtCerto3={t("html.basic.buttons.ButtonEx4_txtCerto3")}
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
            pergunta={t("html.basic.buttons.ButtonEx5_pergunta")}
            opt1={t("html.basic.buttons.ButtonEx5_opt1")}
            opt2={t("html.basic.buttons.ButtonEx5_opt2")}
            opt3={t("html.basic.buttons.ButtonEx5_opt3")}
            opt4={t("html.basic.buttons.ButtonEx5_opt4")}
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
            pergunta={t("html.basic.buttons.ButtonEx6_pergunta")}
            opt1={t("html.basic.buttons.ButtonEx6_opt1")}
            opt2={t("html.basic.buttons.ButtonEx6_opt2")}
            opt3={t("html.basic.buttons.ButtonEx6_opt3")}
            opt4={t("html.basic.buttons.ButtonEx6_opt4")}
            opt5={t("html.basic.buttons.ButtonEx6_opt5")}
            opt6={t("html.basic.buttons.ButtonEx6_opt6")}
            opt7={t("html.basic.buttons.ButtonEx6_opt7")}
            opt8={t("html.basic.buttons.ButtonEx6_opt8")}
            txtCerto={t("html.basic.buttons.ButtonEx6_txtCerto")}
            aulaSalvar={10}
            Salvar={true}
            navegar="CongratsView"
        />
    )
}




