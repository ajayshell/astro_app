import { useEffect, useState } from "react";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import type { BirthInput } from "../astro/types";

interface Props {
  onSubmit: (input: BirthInput) => void;
}

const CUSTOM_OPTION = "__custom__";
const DEFAULT_CITY = "Bengaluru";

export function BirthForm({ onSubmit }: Props) {
  const [name, setName] = useState("Aj");
  const [date, setDate] = useState("1979-06-29");
  const [time, setTime] = useState("08:21");
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
      setError("Latitude/longitude must be valid numbers.");
      return null;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Latitude must be -90..90 and longitude -180..180.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve time zone for this location.");
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
      <h2>Birth details</h2>

      <label>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aj" />
      </label>

      <label>
        Date of birth
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label>
        Time of birth
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </label>

      <label>
        Place of birth
        <select value={cityName} onChange={(e) => setCityName(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}, {c.state}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Custom coordinates...</option>
        </select>
      </label>

      {usingCustom && (
        <div className="custom-coords">
          <label>
            Latitude
            <input
              type="number"
              step="any"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
            />
          </label>
          <label>
            Longitude
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

      <button type="submit">Generate chart</button>
    </form>
  );
}
