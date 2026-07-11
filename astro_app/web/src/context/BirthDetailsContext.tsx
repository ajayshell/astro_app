import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Date/time/place shared across pages (Horoscope, Jamakol): once chosen on
// either page, switching to the other page should reflect the same values
// rather than each page tracking its own independent birth details.
export interface BirthDetailsState {
  date: string;
  time: string;
  // City id (data/cities.ts `City.id`, a GeoNames city id), or CUSTOM_OPTION
  // if custom coordinates are being used. Not the city *name* -- at ~24k
  // entries there are hundreds of duplicate names (multiple "Raipur"s,
  // "San Pedro"s, etc.), so name alone can't uniquely identify a selection.
  cityId: string;
  customLat: string;
  customLon: string;
}

interface BirthDetailsContextValue extends BirthDetailsState {
  setDate: (v: string) => void;
  setTime: (v: string) => void;
  setCityId: (v: string) => void;
  setCustomLat: (v: string) => void;
  setCustomLon: (v: string) => void;
}

// "1277333" = Bengaluru's id in data/cities.ts.
const DEFAULT_STATE: BirthDetailsState = {
  date: "1974-04-16",
  time: "10:04",
  cityId: "1277333",
  customLat: "12.9716",
  customLon: "77.5946",
};

const BirthDetailsContext = createContext<BirthDetailsContextValue | null>(null);

export function BirthDetailsProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(DEFAULT_STATE.date);
  const [time, setTime] = useState(DEFAULT_STATE.time);
  const [cityId, setCityId] = useState(DEFAULT_STATE.cityId);
  const [customLat, setCustomLat] = useState(DEFAULT_STATE.customLat);
  const [customLon, setCustomLon] = useState(DEFAULT_STATE.customLon);

  const value: BirthDetailsContextValue = {
    date,
    setDate,
    time,
    setTime,
    cityId,
    setCityId,
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
