import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './lang/en.json';
// Feature bundles
import ptAccount from './features/account/lang/pt.json';
import enMarketplace from './features/marketplace/lang/en.json';
import ptMarketplace from './features/marketplace/lang/pt.json';
// Newly added feature bundles (scaffolds for now)
import enAuth from './features/auth/lang/en.json';
import ptAuth from './features/auth/lang/pt.json';
import enAdmin from './features/admin/lang/en.json';
import ptAdmin from './features/admin/lang/pt.json';
import enChat from './features/chat/lang/en.json';
import ptChat from './features/chat/lang/pt.json';
import enPayments from './features/payments/lang/en.json';
import ptPayments from './features/payments/lang/pt.json';
import enUsers from './features/users/lang/en.json';
import ptUsers from './features/users/lang/pt.json';

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

// Helper to merge multiple sources
function mergeAll<T extends Record<string, any>>(base: T, ...sources: T[]): T {
  return sources.reduce((acc, src) => mergeDeep(acc, src), base);
}

// Merge order:
// - EN: global -> marketplace -> auth -> admin -> chat -> payments -> users
// - PT: account -> marketplace -> auth -> admin -> chat -> payments -> users
//   (global PT was removed in this repo; account PT serves as base)
const enMerged = mergeAll(
  { ...en },
  enMarketplace,
  enAuth,
  enAdmin,
  enChat,
  enPayments,
  enUsers,
);
const ptMerged = mergeAll(
  { ...ptAccount },
  ptMarketplace,
  ptAuth,
  ptAdmin,
  ptChat,
  ptPayments,
  ptUsers,
);

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
