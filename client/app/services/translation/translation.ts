import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enGB from './locales/en-GB.json';
import msMY from './locales/ms-MY.json';
import taIN from './locales/ta-IN.json';
import cmnCN from './locales/cmn-CN.json';
import deDE from './locales/de-DE.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import hiIN from './locales/hi-IN.json';
import itIT from './locales/it-IT.json';
import jaJP from './locales/ja-JP.json';
import koKR from './locales/ko-KR.json';
import ruRU from './locales/ru-RU.json';

export const resources = {
  'en-GB': { translation: enGB },
  'ms-MY': { translation: msMY },
  'ta-IN': { translation: taIN },
  'zh-CN': { translation: cmnCN },
  'de-DE': { translation: deDE },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'hi-IN': { translation: hiIN },
  'it-IT': { translation: itIT },
  'ja-JP': { translation: jaJP },
  'ko-KR': { translation: koKR },
  'ru-RU': { translation: ruRU },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-GB',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
