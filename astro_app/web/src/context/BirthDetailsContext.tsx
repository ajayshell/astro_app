import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Date/time/place shared across pages (Horoscope, Jamakol): once chosen on
// either page, switching to the other page should reflect the same values
// rather than each page tracking its own independent birth details.
export interface BirthDetailsState {
  date: string;
  time: string;
  cityName: string;
  customLat: string;
  customLon: string;
}

interface BirthDetailsContextValue extends BirthDetailsState {
  setDate: (v: string) => void;
  setTime: (v: string) => void;
  setCityName: (v: string) => void;
  setCustomLat: (v: string) => void;
  setCustomLon: (v: string) => void;
}

const DEFAULT_STATE: BirthDetailsState = {
  date: "1974-04-16",
  time: "10:04",
  cityName: "Bengaluru",
  customLat: "12.9716",
  customLon: "77.5946",
};

const BirthDetailsContext = createContext<BirthDetailsContextValue | null>(null);

export function BirthDetailsProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(DEFAULT_STATE.date);
  const [time, setTime] = useState(DEFAULT_STATE.time);
  const [cityName, setCityName] = useState(DEFAULT_STATE.cityName);
  const [customLat, setCustomLat] = useState(DEFAULT_STATE.customLat);
  const [customLon, setCustomLon] = useState(DEFAULT_STATE.customLon);

  const value: BirthDetailsContextValue = {
    date,
    setDate,
    time,
    setTime,
    cityName,
    setCityName,
    customLat,
    setCustomLat,
    customLon,
    setCustomLon,
  };

  return <BirthDetailsContext.Provider value={value}>{children}</BirthDetailsContext.Provider>;
}

export function useBirthDetails(): BirthDetailsContextValue {
  const ctx = useContext(BirthDetailsContext);
  if (!ctx) throw new Error("useBirthDetails must be used within a BirthDetailsProvider");
  return ctx;
}
