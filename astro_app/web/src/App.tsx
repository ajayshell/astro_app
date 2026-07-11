import { useState } from "react";
import { HoroscopePage } from "./pages/HoroscopePage";
import { JamakolPage } from "./pages/JamakolPage";
import { useI18n } from "./i18n/LanguageContext";
import type { Language } from "./i18n/translations";
import { SUPPORT_EMAIL } from "./config";
import "./App.css";

type Page = "horoscope" | "jamakol";

function App() {
  const { language, setLanguage, t } = useI18n();
  const [page, setPage] = useState<Page>("horoscope");

  return (
    <div className="app-shell">
      <div className="top-bar">
        <a className="contact-us-badge" href={`mailto:${SUPPORT_EMAIL}`}>
          {t("contactUs")}: {SUPPORT_EMAIL}
        </a>
        <label className="language-toggle">
          {t("language")}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>
        </label>
      </div>

      <nav className="tab-bar">
        <button type="button" className={page === "horoscope" ? "tab-active" : ""} onClick={() => setPage("horoscope")}>
          {t("tabHoroscope")}
        </button>
        <button type="button" className={page === "jamakol" ? "tab-active" : ""} onClick={() => setPage("jamakol")}>
          {t("tabJamakol")}
        </button>
      </nav>

      {page === "horoscope" ? <HoroscopePage /> : <JamakolPage />}
    </div>
  );
}

export default App;
