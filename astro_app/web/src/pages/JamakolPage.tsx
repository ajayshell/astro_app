import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import { localWallClockToUtc } from "../astro/util";
import { computeJamakol } from "../astro/jamakol";
import type { JamakolResult } from "../astro/jamakol";
import { useI18n } from "../i18n/LanguageContext";

const CUSTOM_OPTION = "__custom__";
const DEFAULT_CITY = "Bengaluru";

function fmtTime(d: Date, zoneName: string): string {
  return DateTime.fromJSDate(d).setZone(zoneName).toFormat("h:mm a");
}

export function JamakolPage() {
  const { t, planetName } = useI18n();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [customLat, setCustomLat] = useState("12.9716");
  const [customLon, setCustomLon] = useState("77.5946");
  const [result, setResult] = useState<JamakolResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityName === CUSTOM_OPTION;

  function resolveLocation(): { latitude: number; longitude: number; placeName: string } | null {
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
    return { latitude, longitude, placeName: usingCustom ? `${latitude}, ${longitude}` : cityName };
  }

  function generate(referenceInstant: Date, latitude: number, longitude: number) {
    try {
      setError(null);
      setResult(computeJamakol(referenceInstant, latitude, longitude));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tzError"));
    }
  }

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const location = resolveLocation();
    if (!location) return;
    try {
      const { offsetHours } = resolveTimezone(location.latitude, location.longitude, date, time);
      generate(localWallClockToUtc(date, time, offsetHours), location.latitude, location.longitude);
    } catch {
      setError(t("tzError"));
    }
  }

  function handleUseNow() {
    const location = resolveLocation();
    if (!location) return;
    const now = new Date();
    try {
      const zoneName = tzlookup(location.latitude, location.longitude);
      const local = DateTime.fromJSDate(now).setZone(zoneName);
      setDate(local.toFormat("yyyy-MM-dd"));
      setTime(local.toFormat("HH:mm"));
      generate(now, location.latitude, location.longitude);
    } catch {
      setError(t("tzError"));
    }
  }

  // Default the page to "now" at the default place on first load.
  useEffect(() => {
    handleUseNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header>
        <h1>{t("jamakolTitle")}</h1>
        <p className="subtitle">{t("jamakolSubtitle")}</p>
      </header>

      <div className="app-body">
        <p className="jamakol-warning">{t("jamakolWarning")}</p>

        <div className="below-row">
          <form className="birth-form" onSubmit={handleGenerate}>
            <h2>{t("dateAndTime")}</h2>

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
                  <input type="number" step="any" value={customLat} onChange={(e) => setCustomLat(e.target.value)} />
                </label>
                <label>
                  {t("longitude")}
                  <input type="number" step="any" value={customLon} onChange={(e) => setCustomLon(e.target.value)} />
                </label>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit">{t("generate")}</button>
            <button type="button" onClick={handleUseNow}>
              {t("useNow")}
            </button>
          </form>

          {result && (
            <div className="summary">
              <h3>{t("computedValues")}</h3>
              <p>{t("weekdayLordLabel")}: {planetName(result.weekdayLord)}</p>
              <p>{t("sunriseLabel")}: {fmtTime(result.sunrise, result.zoneName)}</p>
              <p>{t("sunsetLabel")}: {fmtTime(result.sunset, result.zoneName)}</p>
              <p>{t("nextSunriseLabel")}: {fmtTime(result.nextSunrise, result.zoneName)}</p>
            </div>
          )}
        </div>

        {result && (
          <section className="jamakol-section">
            <table className="jamakol-table">
              <thead>
                <tr>
                  <th>{t("jamam")}</th>
                  <th></th>
                  <th>{t("graha")}</th>
                  <th>{t("start")}</th>
                  <th>{t("end")}</th>
                </tr>
              </thead>
              <tbody>
                {result.periods.map((p, i) => (
                  <tr key={p.index} className={i === result.currentIndex ? "jamakol-row-current" : ""}>
                    <td>{p.index}</td>
                    <td>{p.isDay ? t("dayLabel") : t("nightLabel")}</td>
                    <td>{planetName(p.lord)}</td>
                    <td>{fmtTime(p.start, result.zoneName)}</td>
                    <td>{fmtTime(p.end, result.zoneName)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </>
  );
}
