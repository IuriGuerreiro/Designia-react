import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './lang/en.json';
// Portuguese now comes from feature bundles
import ptAccount from './features/account/lang/pt.json';
import enMarketplace from './features/marketplace/lang/en.json';
import ptMarketplace from './features/marketplace/lang/pt.json';

// Simple deep merge to combine global + feature translations
function mergeDeep<T extends Record<string, any>>(target: T, source: T): T {
  for (const key of Object.keys(source)) {
    const srcVal = (source as any)[key];
    const tgtVal = (target as any)[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      (target as any)[key] = mergeDeep(tgtVal ? { ...tgtVal } : {}, srcVal);
    } else {
      (target as any)[key] = srcVal;
    }
  }
  return target;
}

// Merge order:
// - EN: global -> marketplace (account EN merged into marketplace per repo change)
// - PT: account -> marketplace (global PT removed; using feature bundles)
const enMerged = mergeDeep({ ...en }, enMarketplace);
const ptMerged = mergeDeep({ ...ptAccount }, ptMarketplace);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enMerged,
      pt: ptMerged,
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
