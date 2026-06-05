import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.js";
import fr from "./fr.js";

const STORAGE_KEY = "qa-reviewer-lang";

const messages = { en, fr };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "fr" ? "fr" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next) => {
    if (next === "en" || next === "fr") setLangState(next);
  };

  const t = useMemo(() => messages[lang] ?? messages.en, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
