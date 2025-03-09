import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import heTranslation from "../locales/he.json";

// Configure i18next
i18n
  .use(initReactI18next) // Initialize react-i18next
  .init({
    resources: {
      he: {
        translation: heTranslation,
      },
    },
    lng: "he", // Default language
    fallbackLng: "he",
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: false, // Prevents issues with React Suspense
    },
  });

export default i18n;
