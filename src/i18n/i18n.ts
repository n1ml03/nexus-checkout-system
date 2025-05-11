
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

// Get the saved language preference
const savedLanguage = localStorage.getItem('preferredLanguage');

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    lng: savedLanguage || undefined, // Use saved language if available
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        translation: enTranslation,
      },
      vi: {
        translation: viTranslation,
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

// Add a language change event listener to synchronize across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'preferredLanguage' && event.newValue && event.newValue !== i18n.language) {
    i18n.changeLanguage(event.newValue);
  }
});

export default i18n;
