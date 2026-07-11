import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { City } from "../data/cities";

// The full city list (~24k entries, GeoNames-derived) is a few hundred KB
// gzipped -- far too large to include in the main bundle. Loaded once, lazily,
// via a dynamic import (its own code-split chunk), and shared here so both
// pages use the same loaded list instead of each re-triggering the import.
interface CitiesContextValue {
  cities: City[] | null; // null until loaded
}

const CitiesContext = createContext<CitiesContextValue | null>(null);

export function CitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[] | null>(null);

  useEffect(() => {
    import("../data/cities").then((mod) => setCities(mod.CITIES));
  }, []);

  return <CitiesContext.Provider value={{ cities }}>{children}</CitiesContext.Provider>;
}

export function useCities(): CitiesContextValue {
  const ctx = useContext(CitiesContext);
  if (!ctx) throw new Error("useCities must be used within a CitiesProvider");
  return ctx;
}
