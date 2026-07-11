import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { RASI_NAMES, NAKSHATRA_NAMES, WEEKDAY_NAMES } from "../astro/constants";
import type { PlanetName } from "../astro/constants";
import { RASI_ABBR } from "../astro/format";
import { CHARA_KARAKA_NAMES } from "../astro/charaKaraka";
import {
  ASCENDANT_MARKER,
  CHARA_KARAKA_NAMES_TA,
  NAKSHATRA_NAMES_TA,
  PLANET_NAMES_TA,
  RASI_ABBR_TA,
  RASI_NAMES_TA,
  WEEKDAY_NAMES_TA,
  UI_TEXT,
} from "./translations";
import type { Language } from "./translations";

interface I18n {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: keyof typeof UI_TEXT) => string;
  rasiLabel: (rasiIndex: number) => string;
  rasiFullName: (rasiIndex: number) => string;
  planetName: (planet: PlanetName) => string;
  nakshatraName: (nakshatraIndex: number) => string;
  karakaName: (karakaIndex: number) => string;
  ascendantMarker: () => string;
  weekdayName: (weekdayIndex: number) => string;
}

const LanguageContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = useMemo<I18n>(() => {
    const t = (key: keyof typeof UI_TEXT) => UI_TEXT[key]?.[language] ?? String(key);
    const rasiLabel = (rasiIndex: number) => (language === "ta" ? RASI_ABBR_TA[rasiIndex] : RASI_ABBR[rasiIndex]);
    const rasiFullName = (rasiIndex: number) => (language === "ta" ? RASI_NAMES_TA[rasiIndex] : RASI_NAMES[rasiIndex]);
    const planetName = (planet: PlanetName) => (language === "ta" ? PLANET_NAMES_TA[planet] : planet);
    const nakshatraName = (nakshatraIndex: number) =>
      language === "ta" ? NAKSHATRA_NAMES_TA[nakshatraIndex] : NAKSHATRA_NAMES[nakshatraIndex];
    const karakaName = (karakaIndex: number) =>
      language === "ta" ? CHARA_KARAKA_NAMES_TA[karakaIndex] : CHARA_KARAKA_NAMES[karakaIndex];
    const ascendantMarker = () => ASCENDANT_MARKER[language];
    const weekdayName = (weekdayIndex: number) =>
      language === "ta" ? WEEKDAY_NAMES_TA[weekdayIndex] : WEEKDAY_NAMES[weekdayIndex];

    return {
      language,
      setLanguage,
      t,
      rasiLabel,
      rasiFullName,
      planetName,
      nakshatraName,
      karakaName,
      ascendantMarker,
      weekdayName,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
