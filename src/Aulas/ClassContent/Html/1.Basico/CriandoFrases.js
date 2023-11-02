import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../Helpers/TheoryView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';
import TextView from '../../../../Helpers/TextView';

export function P({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("P_txt")}
            secondText={t("P_adicionaltxt")}
            thirdText="none"
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
  <html>
    <body>
      <h1>Lorem Ipsum</h1>

      <p>Lorem Ipsum</p>
      <p>Lorem Ipsum</p>
      <p>Lorem Ipsum</p>

    </body>
  </html>`}
            endText="none"
            aulaSalvar="none"
            navegar="FraseEx1"
        />
    )
}

export function FraseEx1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx1_pergunta")}
            opt1={t("FraseEx1_opt1")}
            opt2={t("FraseEx1_opt2")}
            opt3={t("FraseEx1_opt3")}
            opt4={t("FraseEx1_opt4")}
            optCerta="opt4"
            aulaSalvar="none"
            navegar="FraseEx2"
        />
    )
}

export function FraseEx2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx2_pergunta")}
            opt1={t("FraseEx2_opt1")}
            opt2={t("FraseEx2_opt2")}
            opt3={t("FraseEx2_opt3")}
            opt4={t("FraseEx2_opt4")}
            optCerta="opt3"
            aulaSalvar="none"
            navegar="FraseEx3"
        />
    )
}

export function FraseEx3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="56%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx3_pergunta")}
            opt1={t("FraseEx3_opt1")}
            opt2={t("FraseEx3_opt2")}
            opt3={t("FraseEx3_opt3")}
            opt4={t("FraseEx3_opt4")}
            opt5={t("FraseEx3_opt5")}
            opt6="none"
            opt7="none"
            opt8="none"
            txtCerto={t("FraseEx3_txtCerto")}
            aulaSalvar="none"
            navegar="FraseEx4"
        />
    )
}

export function FraseEx4({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx4_pergunta")}
            txtantes={t("FraseEx4_txtantes")}
            txtdepois={t("FraseEx4_txtdepois")}
            txtCerto1={t("FraseEx4_txtCerto1")}
            txtCerto2={t("FraseEx4_txtCerto2")}
            txtCerto3={t("FraseEx4_txtCerto3")}
            tamanhoInput="46%"
            aulaSalvar="none"
            navegar="FraseEx5"
        />
    )
}

export function FraseEx5({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx5_pergunta")}
            opt1={t("FraseEx5_opt1")}
            opt2={t("FraseEx5_opt2")}
            opt3={t("FraseEx5_opt3")}
            opt4={t("FraseEx5_opt4")}
            optCerta="opt3"
            navegar="FraseEx6"
        />
    )
}

export function FraseEx6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso="95%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("FraseEx6_pergunta")}
            txtantes={t("FraseEx6_txtantes")}
            txtdepois={t("FraseEx6_txtdepois")}
            txtCerto1={t("FraseEx6_txtCerto1")}
            txtCerto2={t("FraseEx6_txtCerto2")}
            txtCerto3={t("FraseEx6_txtCerto3")}
            tamanhoInput="46%"
            aulaSalvar="CRIANDOFRASES"
            Salvar="true"
            navegar="CongratsView"
        />
    )
}