import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { Storage } from "expo-sqlite/kv-store";
import { format, Locale } from 'date-fns';

// 翻訳ファイルをインポート
import ja_translate from './locales/ja.json';
import en_translate from './locales/en.json';
// date-fnsのロケールをインポート
import { enUS, ja } from 'date-fns/locale';

const translateResources = {
  ja: { translation: ja_translate },
  en: { translation: en_translate },
};
const dateFnsLocales: { [key: string]: Locale } = {
  ja: ja,
  en: enUS,
};

const LANGUAGE_KEY = 'vrcp_user_language';

export const setUserLanguage = async (lang: string) => {
  await Storage.setItemAsync(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}
export const getUserLanguage = async () => {
  const lang = await Storage.getItemAsync(LANGUAGE_KEY);
  return lang || Localization.getLocales()[0]?.languageCode || 'en';
}

const initI18n = async () => {
  const userLang = await getUserLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources: translateResources,
      lng: userLang, // 初期言語
      fallbackLng: 'en',  // 対応していない言語の場合のフォールバック
      interpolation: {
        escapeValue: false,
        format: (value, formatStr, lng) => {
          if (value instanceof Date && formatStr) {
            const locale = dateFnsLocales[lng || 'en'] || enUS;
            return format(value, formatStr, { locale });
          }
          return value;
        },
      },
      compatibilityJSON: 'v4', // Androidでのクラッシュ回避用
    });
};

initI18n();

export default i18n;