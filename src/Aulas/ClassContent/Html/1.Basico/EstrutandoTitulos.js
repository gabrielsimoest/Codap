import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';

export function H1h6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.basic.title.H1h6_txt")}
            secondText="none"
            thirdText="none"
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
  <html>
    <body>
      <h1>Lorem Ipsum</h1>
      <h2>Lorem Ipsum</h2>
      <h3>Lorem Ipsum</h3>
      <h4>Lorem Ipsum</h4>
      <h5>Lorem Ipsum</h5>
      <h6>Lorem Ipsum</h6>
    </body>
  </html>`}
            endText={t("html.basic.title.H1h6_adicionaltxt_end")}
            highlight={["h1"]}
            aulaSalvar="none"
            navegar="HeaderEx1"
        />
    )
}

export function HeaderEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt={t("html.basic.title.HeaderEx1_adicionaltxt")}
            pergunta={t("html.basic.title.HeaderEx1_pergunta")}
            opt1={t("html.basic.title.HeaderEx1_opt1")}
            opt2={t("html.basic.title.HeaderEx1_opt2")}
            opt3={t("html.basic.title.HeaderEx1_opt3")}
            opt4={t("html.basic.title.HeaderEx1_opt4")}
            opt5={t("html.basic.title.HeaderEx1_opt5")}
            opt6={t("html.basic.title.HeaderEx1_opt6")}
            opt7="none"
            opt8="none"
            txtCerto={t("html.basic.title.HeaderEx1_txtCerto")}
            navegar="HeaderEx2"
            tutorialVisible = {true}
        />
    )
}

export function HeaderEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.title.HeaderEx2_pergunta")}
            opt1={t("html.basic.title.HeaderEx2_opt1")}
            opt2={t("html.basic.title.HeaderEx2_opt2")}
            opt3={t("html.basic.title.HeaderEx2_opt3")}
            opt4={t("html.basic.title.HeaderEx2_opt4")}
            optCerta="opt1"
            navegar="HeaderEx3"
        />
    )
}

export function HeaderEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            adicionaltxt={t("html.basic.title.HeaderEx3_adicionaltxt")}
            pergunta={t("html.basic.title.HeaderEx3_pergunta")}
            opt1={t("html.basic.title.HeaderEx3_opt1")}
            opt2={t("html.basic.title.HeaderEx3_opt2")}
            opt3={t("html.basic.title.HeaderEx3_opt3")}
            opt4={t("html.basic.title.HeaderEx3_opt4")}
            opt5={t("html.basic.title.HeaderEx3_opt5")}
            opt6={t("html.basic.title.HeaderEx3_opt6")}
            opt7={t("html.basic.title.HeaderEx3_opt7")}
            opt8="none"
            txtCerto={t("html.basic.title.HeaderEx3_txtCerto")}
            navegar="HeaderEx4"
        />
    )
}

export function HeaderEx4({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.title.HeaderEx4_pergunta")}
            opt1={t("html.basic.title.HeaderEx4_opt1")}
            opt2={t("html.basic.title.HeaderEx4_opt2")}
            opt3={t("html.basic.title.HeaderEx4_opt3")}
            opt4={t("html.basic.title.HeaderEx4_opt4")}
            optCerta="opt2"
            navegar="HeaderEx5"
        />
    )
}

export function HeaderEx5({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.title.HeaderEx5_pergunta")}
            opt1={t("html.basic.title.HeaderEx5_opt1")}
            opt2={t("html.basic.title.HeaderEx5_opt2")}
            opt3={t("html.basic.title.HeaderEx5_opt3")}
            opt4={t("html.basic.title.HeaderEx5_opt4")}
            optCerta="opt1"
            navegar="HeaderEx6"
        />
    )
}

export function HeaderEx6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.title.HeaderEx6_pergunta")}
            txtantes={t("html.basic.title.HeaderEx6_txtantes")}
            txtdepois={t("html.basic.title.HeaderEx6_txtdepois")}
            txtCerto1={t("html.basic.title.HeaderEx6_txtCerto1")}
            txtCerto2={t("html.basic.title.HeaderEx6_txtCerto2")}
            txtCerto3={t("html.basic.title.HeaderEx6_txtCerto3")}
            tamanhoInput="46%"
            aulaSalvar={14}
            Salvar="true"
            navegar="CongratsView"
        />
    )
}




