import 'react';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en_US from './locales/en_US.json';
import zh_CN from './locales/zh_CN.json';
import zh_TW from './locales/zh_TW.json';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  'en': {
    translation: en_US
  },
  'en-US': {
    translation: en_US
  },
  'zh-CN': {
    translation: zh_CN
  },
  'zh-TW': {
    translation: zh_TW
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: process.env.REACT_APP_LANG,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

  export default i18n;