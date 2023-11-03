import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../Helpers/TheoryView';
import OptionView from '../../../../Helpers/OptionView';
import SelectView from '../../../../Helpers/SelectView';

export function ImgTeoric({ navigation }) {
    //Constante de tradução, usar {t("CHAVE")} para tradução
    const { t, i18n } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="14%"
            mainText={t("html.basic.images.ImgTeoric_mainText")}            
            secondText={t("html.basic.images.ImgTeoric_secondText")}
            thirdText={t("html.basic.images.ImgTeoric_thirdText")}
            codeLanguage='HTML'
            code={`<!DOCTYPE html>
  <html>
    <body>

        <img src='https://cdn0.iconfinder.com/data/icons/social-network-9/50/22-512.png' />
        
    </body>
  </html>`} 
            //Textos final opcional (aparece após as imagens)
            endText={t("html.basic.images.ImgTeoric_endText")}
            //NOME ADICIONADO NO STACK NAVIGATOR
            navegar="Img1"
        />
    )
}

// https://img.freepik.com/free-photo/dramatic-white-clouds-blue-sky-from-airplane-window-view-colorful-sunset-cloudscape-background_90220-1208.jpg

export function Img1({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="28%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.images.Img1_pergunta")}
            opt1={t("html.basic.images.Img1_opt1")}
            opt2={t("html.basic.images.Img1_opt2")}
            opt3={t("html.basic.images.Img1_opt3")}
            opt4={t("html.basic.images.Img1_opt4")}
            opt5={t("html.basic.images.Img1_opt5")}
            opt6="none"
            opt7="none"
            opt8="none"
            txtCerto={t("html.basic.images.Img1_txtCerto")}
            navegar="Img2"
        />
    )
}

export function Img2({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="42%"
            sec="9999"
            adicionaltxt={t("html.basic.images.Img2_adicionaltxt")}
            pergunta={t("html.basic.images.Img2_pergunta")}
            opt1={t("html.basic.images.Img2_opt1")}
            opt2={t("html.basic.images.Img2_opt2")}
            opt3={t("html.basic.images.Img2_opt3")}
            opt4={t("html.basic.images.Img2_opt4")}
            opt5={t("html.basic.images.Img2_opt5")}
            opt6={t("html.basic.images.Img2_opt6")}
            opt7={t("html.basic.images.Img2_opt7")}
            opt8="none"
            txtCerto={t("html.basic.images.Img2_txtCerto")}
            navegar="Img3"
        />
    )
}

export function Img3({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="56%" 
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.images.Img3_pergunta")}
            opt1={t("html.basic.images.Img3_opt1")}
            opt2={t("html.basic.images.Img3_opt2")}
            opt3={t("html.basic.images.Img3_opt3")}
            opt4={t("html.basic.images.Img3_opt4")}
            opt5={t("html.basic.images.Img3_opt5")}
            opt6={t("html.basic.images.Img3_opt6")}
            opt7={t("html.basic.images.Img3_opt7")}
            opt8="none"
            txtCerto={t("html.basic.images.Img3_txtCerto")}
            navegar="Img4"
        />
    )
}

export function Img4({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="70%"
            sec="9999"
            adicionaltxt={t("html.basic.images.Img4_adicionaltxt")}
            pergunta={t("html.basic.images.Img4_pergunta")}
            opt1={t("html.basic.images.Img4_opt1")}
            opt2={t("html.basic.images.Img4_opt2")}
            opt3={t("html.basic.images.Img4_opt3")}
            opt4={t("html.basic.images.Img4_opt4")}
            opt5={t("html.basic.images.Img4_opt5")}
            opt6={t("html.basic.images.Img4_opt6")}
            opt7={t("html.basic.images.Img4_opt7")}
            opt8="none"
            txtCerto={t("html.basic.images.Img4_txtCerto")}
            navegar="Img5"
        />
    )
}

export function Img5({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="84%"
            sec="9999"
            adicionaltxt={t("html.basic.images.Img5_adicionaltxt")}
            pergunta={t("html.basic.images.Img5_pergunta")}
            opt1={t("html.basic.images.Img5_opt1")}
            opt2={t("html.basic.images.Img5_opt2")}
            opt3={t("html.basic.images.Img5_opt3")}
            opt4={t("html.basic.images.Img5_opt4")}
            optCerta="opt2"
            navegar="Img6"
        />
    )
}

export function Img6({ navigation }) {
    const { t, i18n } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="96%"
            sec="9999"
            adicionaltxt="none"
            pergunta={t("html.basic.images.Img6_pergunta")}
            opt1={t("html.basic.images.Img6_opt1")}
            opt2={t("html.basic.images.Img6_opt2")}
            opt3={t("html.basic.images.Img6_opt3")}
            opt4={t("html.basic.images.Img6_opt4")}
            optCerta="opt4"
            aulaSalvar="ADICIONANDOIMAGENS"
            Salvar="true"
            navegar="CongratsView"
        />
    )
}