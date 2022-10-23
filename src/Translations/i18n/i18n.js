import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import pt from './pt.json';

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'pt',
    fallbackLng: 'pt',
    resources: {
        en: en,
        pt: pt,
    },
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export default i18n;