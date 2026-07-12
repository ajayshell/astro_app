import { useEffect, useState } from "react";
import { resolveTimezone } from "../astro/timezone";
import type { BirthInput } from "../astro/types";
import { useI18n } from "../i18n/LanguageContext";
import { useBirthDetails } from "../context/BirthDetailsContext";
import { useCities } from "../context/CitiesContext";
import { PlaceSelector, CUSTOM_OPTION } from "./PlaceSelector";

interface Props {
  onSubmit: (input: BirthInput) => void;
}

export function BirthForm({ onSubmit }: Props) {
  const { t } = useI18n();
  const { date, setDate, time, setTime, cityId, setCityId, customLat, setCustomLat, customLon, setCustomLon } =
    useBirthDetails();
  const { cities } = useCities();
  const [name, setName] = useState("Aj");
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityId === CUSTOM_OPTION;

  function buildInput(): BirthInput | null {
    const city = cities?.find((c) => c.id === cityId);
    const latitude = usingCustom ? parseFloat(customLat) : city!.latitude;
    const longitude = usingCustom ? parseFloat(customLon) : city!.longitude;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError(t("latLonInvalid"));
      return null;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError(t("latLonRange"));
      return null;
    }

    const { offsetHours, zoneName } = resolveTimezone(latitude, longitude, date, time);

    return {
      name: name.trim() || "Aj",
      date,
      time,
      latitude,
      longitude,
      timezoneOffsetHours: offsetHours,
      timezoneName: zoneName,
      placeName: usingCustom ? `${latitude}, ${longitude}` : city!.name,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const input = buildInput();
      if (input) onSubmit(input);
    } catch {
      setError(t("tzError"));
    }
  }

  // Generate a chart for the default birth details on first load, so the
  // page isn't empty before the user has touched the form. Waits for the
  // (lazily loaded) city list, since the default place is looked up by id.
  useEffect(() => {
    if (!cities) return;
    try {
      const input = buildInput();
      if (input) onSubmit(input);
    } catch {
      // Leave the form empty; the user can still submit manually.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <h2>{t("birthDetails")}</h2>

      <label>
        {t("name")}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aj" />
      </label>

      <label>
        {t("dateOfBirth")}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label>
        {t("timeOfBirth")}
        <input type="time" step="1" value={time} onChange={(e) => setTime(e.target.value)} required />
      </label>

      <PlaceSelector
        cityId={cityId}
        setCityId={setCityId}
        customLat={customLat}
        setCustomLat={setCustomLat}
        customLon={customLon}
        setCustomLon={setCustomLon}
      />

      {error && <p className="form-error">{error}</p>}

      <button type="submit">{t("generateChart")}</button>
    </form>
  );
}
