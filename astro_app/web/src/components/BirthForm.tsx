import { useEffect, useState } from "react";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import type { BirthInput } from "../astro/types";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  onSubmit: (input: BirthInput) => void;
}

const CUSTOM_OPTION = "__custom__";
const DEFAULT_CITY = "Bengaluru";

export function BirthForm({ onSubmit }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState("Aj");
  const [date, setDate] = useState("1974-04-16");
  const [time, setTime] = useState("10:04");
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [customLat, setCustomLat] = useState("12.9716");
  const [customLon, setCustomLon] = useState("77.5946");
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityName === CUSTOM_OPTION;

  function buildInput(): BirthInput | null {
    const city = CITIES.find((c) => c.name === cityName);
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
      placeName: usingCustom ? `${latitude}, ${longitude}` : cityName,
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
  // page isn't empty before the user has touched the form.
  useEffect(() => {
    try {
      const input = buildInput();
      if (input) onSubmit(input);
    } catch {
      // Leave the form empty; the user can still submit manually.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </label>

      <label>
        {t("placeOfBirth")}
        <select value={cityName} onChange={(e) => setCityName(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}, {c.state}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>{t("customCoordinates")}</option>
        </select>
      </label>

      {usingCustom && (
        <div className="custom-coords">
          <label>
            {t("latitude")}
            <input
              type="number"
              step="any"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
            />
          </label>
          <label>
            {t("longitude")}
            <input
              type="number"
              step="any"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
            />
          </label>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="submit">{t("generateChart")}</button>
    </form>
  );
}
