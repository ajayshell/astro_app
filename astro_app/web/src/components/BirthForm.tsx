import { useState } from "react";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import type { BirthInput } from "../astro/types";

interface Props {
  onSubmit: (input: BirthInput) => void;
}

const CUSTOM_OPTION = "__custom__";

export function BirthForm({ onSubmit }: Props) {
  const [date, setDate] = useState("2000-01-01");
  const [time, setTime] = useState("12:00");
  const [cityName, setCityName] = useState(CITIES[0].name);
  const [customLat, setCustomLat] = useState("13.0827");
  const [customLon, setCustomLon] = useState("80.2707");
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityName === CUSTOM_OPTION;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const city = CITIES.find((c) => c.name === cityName);
      const latitude = usingCustom ? parseFloat(customLat) : city!.latitude;
      const longitude = usingCustom ? parseFloat(customLon) : city!.longitude;

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        setError("Latitude/longitude must be valid numbers.");
        return;
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        setError("Latitude must be -90..90 and longitude -180..180.");
        return;
      }

      const { offsetHours, zoneName } = resolveTimezone(latitude, longitude, date, time);

      onSubmit({
        date,
        time,
        latitude,
        longitude,
        timezoneOffsetHours: offsetHours,
        timezoneName: zoneName,
        placeName: usingCustom ? `${latitude}, ${longitude}` : cityName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve time zone for this location.");
    }
  }

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <h2>Birth details</h2>

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
