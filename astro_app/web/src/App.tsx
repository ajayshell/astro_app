import { useState } from "react";
import { HoroscopePage } from "./pages/HoroscopePage";
import { JamakolPage } from "./pages/JamakolPage";
import { UserGuidePage } from "./pages/UserGuidePage";
import { useI18n } from "./i18n/LanguageContext";
import type { Language } from "./i18n/translations";
import { SUPPORT_EMAIL } from "./config";
import { MailIcon, BookIcon, AlertIcon } from "./components/Icons";
import { useBirthDetails } from "./context/BirthDetailsContext";
import { useCities } from "./context/CitiesContext";
import { CUSTOM_OPTION } from "./components/PlaceSelector";
import { to12HourTime } from "./astro/format";
import "./App.css";

type Page = "horoscope" | "jamakol" | "userGuide";

function App() {
  const { language, setLanguage, t } = useI18n();
  const [page, setPage] = useState<Page>("horoscope");
  const { date, time, cityId, customLat, customLon } = useBirthDetails();
  const { cities } = useCities();

  const placeLabel =
    cityId === CUSTOM_OPTION ? `${customLat}, ${customLon}` : (cities?.find((c) => c.id === cityId)?.name ?? cityId);

  const reportErrorBody = [
    `${t("dateOfBirth")}: ${date.split("-").reverse().join("-")}`,
    `${t("timeOfBirth")}: ${to12HourTime(time)}`,
    `${t("placeOfBirth")}: ${placeLabel}`,
    "",
    t("reportErrorDescribeIssue"),
    "",
  ].join("\n");
  const reportErrorHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t("reportErrorSubject"))}&body=${encodeURIComponent(reportErrorBody)}`;

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
          <a className="contact-us-badge badge-secondary" href={reportErrorHref}>
            <AlertIcon />
            {t("reportError")}
          </a>
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
