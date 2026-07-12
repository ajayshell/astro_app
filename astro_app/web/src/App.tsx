import { useState } from "react";
import { HoroscopePage } from "./pages/HoroscopePage";
import { JamakolPage } from "./pages/JamakolPage";
import { UserGuidePage } from "./pages/UserGuidePage";
import { useI18n } from "./i18n/LanguageContext";
import type { Language } from "./i18n/translations";
import { SUPPORT_EMAIL } from "./config";
import { MailIcon, BookIcon } from "./components/Icons";
import "./App.css";

type Page = "horoscope" | "jamakol" | "userGuide";

function App() {
  const { language, setLanguage, t } = useI18n();
  const [page, setPage] = useState<Page>("horoscope");

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="top-bar-badges">
          <a className="contact-us-badge" href={`mailto:${SUPPORT_EMAIL}`}>
            <MailIcon />
            {t("contactUs")}: {SUPPORT_EMAIL}
          </a>
          <button type="button" className="contact-us-badge badge-secondary" onClick={() => setPage("userGuide")}>
            <BookIcon />
            {t("userGuide")}
          </button>
        </div>
        <label className="language-toggle">
          {t("language")}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>
        </label>
      </div>

      {page !== "userGuide" && (
        <nav className="tab-bar">
          <button type="button" className={page === "horoscope" ? "tab-active" : ""} onClick={() => setPage("horoscope")}>
            {t("tabHoroscope")}
          </button>
          <button
            type="button"
            className={page === "jamakol" ? "tab-active tab-active-secondary" : ""}
            onClick={() => setPage("jamakol")}
          >
            {t("tabJamakol")}
          </button>
        </nav>
      )}

      {page === "horoscope" && <HoroscopePage />}
      {page === "jamakol" && <JamakolPage />}
      {page === "userGuide" && <UserGuidePage onBack={() => setPage("horoscope")} />}
    </div>
  );
}

export default App;
