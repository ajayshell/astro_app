import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/LanguageContext";
import { useCities } from "../context/CitiesContext";

export const CUSTOM_OPTION = "__custom__";

interface Props {
  cityId: string;
  setCityId: (id: string) => void;
  customLat: string;
  setCustomLat: (v: string) => void;
  customLon: string;
  setCustomLon: (v: string) => void;
}

// Country -> State -> City cascading selects, instead of one flat list.
// A single <select> with ~24k <option>s (one per city.ts entry) is slow to
// render as DOM, independent of how fast the underlying data loads --
// cascading keeps each select's rendered option count small (at most a few
// hundred, e.g. the biggest state/country group in the data is ~650 cities)
// regardless of the full list's total size.
export function PlaceSelector({ cityId, setCityId, customLat, setCustomLat, customLon, setCustomLon }: Props) {
  const { t } = useI18n();
  const { cities } = useCities();
  const usingCustom = cityId === CUSTOM_OPTION;

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  // Countries in the order they appear in cities.ts (India first, then
  // alphabetical -- see generate-cities.cjs).
  const countries = useMemo(() => {
    if (!cities) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of cities) {
      if (!seen.has(c.country)) {
        seen.add(c.country);
        list.push(c.country);
      }
    }
    return list;
  }, [cities]);

  const statesInCountry = useMemo(() => {
    if (!cities || !country) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of cities) {
      if (c.country === country && !seen.has(c.state)) {
        seen.add(c.state);
        list.push(c.state);
      }
    }
    return list.sort((a, b) => a.localeCompare(b));
  }, [cities, country]);

  const citiesInState = useMemo(() => {
    if (!cities || !country || !state) return [];
    return cities.filter((c) => c.country === country && c.state === state).sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, country, state]);

  // Keep the Country/State selects in sync with whichever city is actually
  // selected -- handles the initial default and switching tabs, since
  // cityId comes from shared context and can change without this
  // component's own dropdowns having been touched.
  useEffect(() => {
    if (usingCustom || !cities) return;
    const selected = cities.find((c) => c.id === cityId);
    if (selected) {
      setCountry(selected.country);
      setState(selected.state);
    } else if (!country && countries.length > 0) {
      setCountry(countries[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, cityId, usingCustom]);

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    const firstState = cities?.find((c) => c.country === newCountry)?.state ?? "";
    setState(firstState);
    const firstCity = cities?.find((c) => c.country === newCountry && c.state === firstState);
    if (firstCity) setCityId(firstCity.id);
  }

  function handleStateChange(newState: string) {
    setState(newState);
    const firstCity = cities?.find((c) => c.country === country && c.state === newState);
    if (firstCity) setCityId(firstCity.id);
  }

  return (
    <>
      <label>
        {t("country")}
        <select value={country} onChange={(e) => handleCountryChange(e.target.value)} disabled={!cities}>
          {!cities && <option value="">{t("loadingPlaces")}</option>}
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t("stateProvince")}
        <select value={state} onChange={(e) => handleStateChange(e.target.value)} disabled={!cities}>
          {statesInCountry.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t("city")}
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={!cities}>
          {citiesInState.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>{t("customCoordinates")}</option>
        </select>
      </label>
      <p className="data-credit">{t("placeDataCredit")}</p>

      {usingCustom && (
        <div className="custom-coords">
          <label>
            {t("latitude")}
            <input type="number" step="any" value={customLat} onChange={(e) => setCustomLat(e.target.value)} />
          </label>
          <label>
            {t("longitude")}
            <input type="number" step="any" value={customLon} onChange={(e) => setCustomLon(e.target.value)} />
          </label>
        </div>
      )}
    </>
  );
}
