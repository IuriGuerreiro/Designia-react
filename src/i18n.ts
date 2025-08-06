import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './lang/en.json';
import pt from './lang/pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      pt,
    },
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'], // Where to cache the language
    },
  });

export default i18n;