import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import { localWallClockToUtc } from "../astro/util";
import { computeJamakol } from "../astro/jamakol";
import type { JamakolGraha, JamakolResult } from "../astro/jamakol";
import { useI18n } from "../i18n/LanguageContext";

const CUSTOM_OPTION = "__custom__";
const DEFAULT_CITY = "Bengaluru";

// Anti-clockwise from the top-left corner, in a 6x6 grid: the 8 ring boxes
// sit at the 4 corners + 4 edge positions (NOT edge midpoints -- traced from
// a reference screenshot, the edge boxes are offset in a rotationally
// symmetric pattern: top at col3, bottom at col4, right at row3, left at
// row4). The inner 4x4 (rows 2-5, cols 2-5) is a separate area, structured
// like a South Indian chart (12 perimeter cells + a 2x2 center for
// date/time), currently blank pending rules for what goes in those cells.
// ringPosition is index-aligned to jamakol.ts's RING_ORDER.
const RING_POSITIONS: { row: number; col: number }[] = [
  { row: 1, col: 1 }, // 0: top-left corner
  { row: 4, col: 1 }, // 1: left edge
  { row: 6, col: 1 }, // 2: bottom-left corner
  { row: 6, col: 4 }, // 3: bottom edge
  { row: 6, col: 6 }, // 4: bottom-right corner
  { row: 3, col: 6 }, // 5: right edge
  { row: 1, col: 6 }, // 6: top-right corner
  { row: 1, col: 3 }, // 7: top edge
];

// The 12 inner cells (South-Indian-chart-style perimeter of the 4x4 inner
// block) with no confirmed content yet -- rendered blank as placeholders.
const INNER_BLANK_CELLS: { row: number; col: number }[] = [
  { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
  { row: 3, col: 2 }, { row: 3, col: 5 },
  { row: 4, col: 2 }, { row: 4, col: 5 },
  { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
];

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
  const [placeLabel, setPlaceLabel] = useState(DEFAULT_CITY);
  const [result, setResult] = useState<JamakolResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityName === CUSTOM_OPTION;

  function grahaName(g: JamakolGraha): string {
    return g === "Maandi" ? t("maandi") : planetName(g);
  }

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

  function generate(referenceInstant: Date, latitude: number, longitude: number, placeName: string) {
    try {
      setError(null);
      setResult(computeJamakol(referenceInstant, latitude, longitude));
      setPlaceLabel(placeName);
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
      generate(localWallClockToUtc(date, time, offsetHours), location.latitude, location.longitude, location.placeName);
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
      generate(now, location.latitude, location.longitude, location.placeName);
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

        <section className="charts-row">
          {result && (
            <div className="jamakol-grid">
              <div className="jamakol-center" style={{ gridRow: "3 / span 2", gridColumn: "3 / span 2" }}>
                <span>{date.split("-").reverse().join("-")}</span>
                <span>{time}</span>
                <span>{placeLabel}</span>
              </div>
              {INNER_BLANK_CELLS.map((pos, i) => (
                <div key={i} className="jamakol-inner-cell" style={{ gridRow: pos.row, gridColumn: pos.col }} />
              ))}
              {result.periods.map((p) => {
                const pos = RING_POSITIONS[p.ringPosition];
                const isCurrent = result.periods.indexOf(p) === result.currentIndex;
                return (
                  <div
                    key={p.ringPosition}
                    className={`jamakol-cell ${isCurrent ? "jamakol-cell-current" : ""}`}
                    style={{ gridRow: pos.row, gridColumn: pos.col }}
                  >
                    <span className="jamakol-cell-graha">{grahaName(p.graha)}</span>
                    <span className="jamakol-cell-degree">{p.degree}°</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
              <p>{t("sunriseLabel")}: {fmtTime(result.sunrise, result.zoneName)}</p>
              <p>{t("sunsetLabel")}: {fmtTime(result.sunset, result.zoneName)}</p>
              <p>{t("nextSunriseLabel")}: {fmtTime(result.nextSunrise, result.zoneName)}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
