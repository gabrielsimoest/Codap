import React from 'react';
import { useTranslation } from 'react-i18next';
import OptionView from '../../../../components/Shared/OptionView';
import TheoryView from '../../../../components/Shared/TheoryView';

export function Estrutura({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <TheoryView
      navigation={navigation}
      progresso="14%"
      mainText={t("html.basic.conhecendo html.Estrutura_mainText")}
      secondText={t("html.basic.conhecendo html.Estrutura_secondText")}
      thirdText="none"
      codeLanguage='HTML'
      code={`<!DOCTYPE html>
  <html>
    <head>
      <title>Minha página</title>
    </head>
    <body>
      <h1>Minha página</h1>
      <p>Esta é a minha primeira página HTML!</p>
    </body>
  </html>`}
      onlyCode={false}
      tutorialVisible={true}
      endText={t("html.basic.conhecendo html.Estrutura_endText")}
      aulaSalvar="none"
      highlight={['HTML', 'NOME', 'Web']}
      navegar="TagsElementos"
    />
  );
}

export function TagsElements({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <TheoryView
      navigation={navigation}
      progresso="28%"
      mainText={t("html.basic.conhecendo html.TagsElements_txt")}
      secondText={t("html.basic.conhecendo html.TagsElements_adicionaltxt")}
      thirdText="none"
      codeLanguage='HTML'
      code={`<!DOCTYPE html>
  <html>
    <head>
      <title>Lorem Ipsum</title>
    </head>
    <body>
      <h1>Lorem Ipsum</h1>
      <p>Lorem Ipsum</p>
    </body>
  </html>`}
      onlyCode={false}
      tutorialVisible={false}
      endText={t("html.basic.conhecendo html.TagsElements_adicionaltxt_end")}
      aulaSalvar="none"
      navegar="HtmlStartEx1"
    />
  );
}

export function HtmlStartEx1({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <OptionView
      navigation={navigation}
      progresso="42%"
      sec="9999"
      adicionaltxt={t("html.basic.conhecendo html.HtmlStartEx1_adicionaltxt")}
      pergunta={t("html.basic.conhecendo html.HtmlStartEx1_pergunta")}
      opt1="<html>"
      opt2="<end html>"
      opt3=">html<"
      opt4="</html>"
      optCerta="opt4"
      aulaSalvar="none"
      tutorialVisible={true}
      navegar="HtmlStartEx2"
    />
  );
}

export function HtmlStartEx2({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <OptionView
      navigation={navigation}
      progresso="56%"
      sec="9999"
      adicionaltxt={t("html.basic.conhecendo html.HtmlStartEx2_adicionaltxt")}
      pergunta={t("html.basic.conhecendo html.HtmlStartEx2_pergunta")}
      opt1="<>"
      opt2="CODAP"
      opt3="h1"
      opt4="</>"
      optCerta="opt3"
      aulaSalvar="none"
      navegar="HtmlStartEx3"
    />
  );
}

export function HtmlStartEx3({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <OptionView
      navigation={navigation}
      progresso="70%"
      sec="9999"
      adicionaltxt="none"
      pergunta={t("html.basic.conhecendo html.HtmlStartEx3_pergunta")}
      opt1="< >"
      opt2="//"
      opt3="TAG="
      opt4="{ }"
      optCerta="opt1"
      aulaSalvar="none"
      navegar="HtmlStartEx4"
    />
  );
}

export function HtmlStartEx4({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <OptionView
      navigation={navigation}
      progresso="84%"
      sec="9999"
      adicionaltxt="none"
      pergunta={t("html.basic.conhecendo html.HtmlStartEx4_pergunta")}
      opt1="'h1'texto'/h1'"
      opt2="|h1|texto|/h1|"
      opt3="h1 texto /h1"
      opt4="<h1>texto</h1>"
      optCerta="opt4"
      aulaSalvar="none"
      navegar="HtmlStartEx5"
    />
  );
}
export function HtmlStartEx5({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <OptionView
      navigation={navigation}
      progresso="95%"
      sec="9999"
      adicionaltxt="none"
      pergunta={t("html.basic.conhecendo html.HtmlStartEx5_pergunta")}
      opt1={t("html.basic.conhecendo html.HtmlStartEx5_opt1")}
      opt2={t("html.basic.conhecendo html.HtmlStartEx5_opt2")}
      opt3={t("html.basic.conhecendo html.HtmlStartEx5_opt3")}
      opt4={t("html.basic.conhecendo html.HtmlStartEx5_opt4")}
      optCerta="opt1"
      aulaSalvar={13}
      Salvar="true"
      navegar="CongratsView"
    />
  );
}
