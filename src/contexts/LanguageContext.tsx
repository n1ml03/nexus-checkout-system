import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳'
  }
];

interface LanguageContextType {
  currentLanguage: Language | null;
  changeLanguage: (code: string) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);

  // Initialize language from localStorage or default to browser language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const languageToUse = savedLanguage || i18n.language || 'en';

    const lang = languages.find(lang => lang.code === languageToUse);
    setCurrentLanguage(lang || languages[0]);

    if (i18n.language !== languageToUse) {
      i18n.changeLanguage(languageToUse);
    }
  }, []);

  // Update current language when i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const lang = languages.find(lang => lang.code === lng);
      setCurrentLanguage(lang || languages[0]);
    };

    // Subscribe to language change event
    i18n.on('languageChanged', handleLanguageChanged);

    // Initial setup
    const lang = languages.find(lang => lang.code === i18n.language);
    setCurrentLanguage(lang || languages[0]);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const changeLanguage = (code: string) => {
    const selectedLang = languages.find(lang => lang.code === code);
    const prevLang = currentLanguage;

    if (selectedLang && (!prevLang || prevLang.code !== selectedLang.code)) {
      i18n.changeLanguage(code);
      localStorage.setItem('preferredLanguage', code);

      // Show notification about language change
      toast.success(
        `${selectedLang.flag} ${t('ui.language_changed', { language: selectedLang.name })}`,
        {
          duration: 3000,
          position: 'bottom-center',
        }
      );
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        languages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
