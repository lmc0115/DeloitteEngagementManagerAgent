import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-selector" role="group" aria-label={t.lang.label}>
      <button
        type="button"
        className={`lang-btn ${lang === "en" ? "active" : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === "fr" ? "active" : ""}`}
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
      >
        FR
      </button>
    </div>
  );
}
