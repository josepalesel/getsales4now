import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("gs4n_lang");
    if (stored === "en" || stored === "es" || stored === "pt") return stored;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("pt")) return "pt";
    if (browserLang.startsWith("es")) return "es";
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("gs4n_lang", lang);
  };

  const t = (key: string) => translate(language, key);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language === "es" ? "es-419" : "en-US";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
