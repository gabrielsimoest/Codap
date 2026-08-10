import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

i18n.use(initReactI18next).init({
	compatibilityJSON: "v4",
	lng: "pt",
	fallbackLng: "pt",
	resources: {
		en: en,
		pt: pt,
	},
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
