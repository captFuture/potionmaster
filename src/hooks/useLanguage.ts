import { useState, useEffect } from 'react';

export type Language = 'en' | 'de' | 'hogwarts';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Default translations for interface
const defaultTranslations: Translations = {
  confirm_title: {
    en: "Confirm Your Order",
    de: "Bestätige deine Bestellung", 
    hogwarts: "Besiegle deine Trankbestellung"
  },
  glass_instruction: {
    en: "Please place your glass on the marked spot now.",
    de: "Bitte stelle jetzt das Glas auf den markierten Punkt.",
    hogwarts: "Platziere den Kelch auf dem leuchtenden Siegel."
  },
  ingredients_label: {
    en: "Ingredients:",
    de: "Zutaten:",
    hogwarts: "Zutaten des Tranks:"
  },
  settings: {
    en: "Settings",
    de: "Einstellungen",
    hogwarts: "Zaubereinstellungen"
  },
  language: {
    en: "Language",
    de: "Sprache", 
    hogwarts: "Zaubersprache"
  },
  ingredients: {
    en: "Ingredients",
    de: "Zutaten",
    hogwarts: "Zauberzutaten"
  },
  back: {
    en: "Back",
    de: "Zurück",
    hogwarts: "Rückkehr"
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState(defaultTranslations);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('potionmaster-language') as Language;
    if (savedLanguage && ['en', 'de', 'hogwarts'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // Load interface translations from backend with fallback to public JSON
    import('../lib/api').then(({ BACKEND_BASE }) => {
      fetch(`${BACKEND_BASE}/api/interface/language`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setTranslations(prev => ({ ...prev, ...data })))
        .catch(() => {
          fetch('/data/interface_language.json')
            .then(r => r.json())
            .then(data => setTranslations(prev => ({ ...prev, ...data })))
            .catch(() => console.log('Using default translations'))
        });
    });
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('potionmaster-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return {
    language,
    setLanguage: changeLanguage,
    translations,
    t
  };
};