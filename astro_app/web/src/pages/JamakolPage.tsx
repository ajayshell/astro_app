import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { CITIES } from "../data/cities";
import { resolveTimezone } from "../astro/timezone";
import { localWallClockToUtc } from "../astro/util";
import { computeJamakol } from "../astro/jamakol";
import type { JamakolGraha, JamakolResult } from "../astro/jamakol";
import { computeChart, buildPlacementMap } from "../astro/charts";
import type { ChartResult } from "../astro/types";
import type { PlanetName } from "../astro/constants";
import type { PlanetSlot } from "../astro/types";
import { SOUTH_INDIAN_GRID_POSITIONS } from "../astro/southIndianGrid";
import { computeAarudom } from "../astro/aarudom";
import type { AarudomCalc } from "../astro/aarudom";
import { computeUdayam } from "../astro/udayam";
import type { UdayamCalc } from "../astro/udayam";
import { computeSooryaVeedhi } from "../astro/sooryaVeedhi";
import type { SooryaVeedhiCalc } from "../astro/sooryaVeedhi";
import { RasiCell } from "../components/RasiCell";
import { useI18n } from "../i18n/LanguageContext";

const CUSTOM_OPTION = "__custom__";
const DEFAULT_CITY = "Bengaluru";

// Anti-clockwise from the top-left corner, in a 6x6 grid: the 8 ring boxes
// sit at the 4 corners + 4 edge positions (NOT edge midpoints -- traced from
// a reference screenshot, the edge boxes are offset in a rotationally
// symmetric pattern: top at col3, bottom at col4, right at row3, left at
// row4). ringPosition is index-aligned to jamakol.ts's RING_ORDER.
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

// The inner 4x4 (rows 2-5, cols 2-5) is a South-Indian Rasi chart (D1) for
// the same date/time/place, shifted one row/column in from the SouthIndianChart
// component's own 4x4 layout to sit inside the larger surrounding ring grid.
const INNER_GRID_POSITIONS = SOUTH_INDIAN_GRID_POSITIONS.map(({ rasi, row, col }) => ({
  rasi,
  row: row + 1,
  col: col + 1,
}));

function fmtTime(d: Date, zoneName: string): string {
  return DateTime.fromJSDate(d).setZone(zoneName).toFormat("h:mm a");
}

// Weekday index (0 = Sunday .. 6 = Saturday) for a "YYYY-MM-DD" date string,
// or null if not yet filled in. Built from the parts directly (not
// `new Date(dateStr)`) so the calendar date isn't shifted by a day in
// timezones where that string would otherwise be parsed as UTC midnight.
function weekdayIndexForDate(dateStr: string): number | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getDay();
}

export function JamakolPage() {
  const { t, planetName, rasiFullName, weekdayName } = useI18n();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [customLat, setCustomLat] = useState("12.9716");
  const [customLon, setCustomLon] = useState("77.5946");
  const [placeLabel, setPlaceLabel] = useState(DEFAULT_CITY);
  const [result, setResult] = useState<JamakolResult | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [placement, setPlacement] = useState<Record<number, PlanetSlot[]>>({});
  const [aarudom, setAarudom] = useState<AarudomCalc | null>(null);
  const [udayam, setUdayam] = useState<UdayamCalc | null>(null);
  const [sooryaVeedhi, setSooryaVeedhi] = useState<SooryaVeedhiCalc | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = cityName === CUSTOM_OPTION;
  const weekdayIndex = weekdayIndexForDate(date);

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

  function generate(
    referenceInstant: Date,
    dateStr: string,
    timeStr: string,
    latitude: number,
    longitude: number,
    timezoneOffsetHours: number,
    placeName: string,
  ) {
    try {
      setError(null);
      const jamakolResult = computeJamakol(referenceInstant, latitude, longitude);
      setResult(jamakolResult);
      const newChart = computeChart({
        name: "Jamakol",
        date: dateStr,
        time: timeStr,
        latitude,
        longitude,
        timezoneOffsetHours,
        placeName,
      });
      setChart(newChart);
      setPlacement(buildPlacementMap(newChart, "D1"));
      const aarudomCalc = computeAarudom(Number(timeStr.split(":")[1]));
      setAarudom(aarudomCalc);
      const sun = newChart.planets.find((p) => p.planet === "Sun")!;
      const udayamCalc = computeUdayam(referenceInstant, jamakolResult.sunrise, jamakolResult.sunset, sun.siderealLongitude);
      setUdayam(udayamCalc);
      setSooryaVeedhi(computeSooryaVeedhi(sun.rasi, aarudomCalc.rasiIndex, aarudomCalc.degree, udayamCalc.rasiIndex));
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
      generate(
        localWallClockToUtc(date, time, offsetHours),
        date,
        time,
        location.latitude,
        location.longitude,
        offsetHours,
        location.placeName,
      );
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
      const dateStr = local.toFormat("yyyy-MM-dd");
      const timeStr = local.toFormat("HH:mm");
      setDate(dateStr);
      setTime(timeStr);
      generate(now, dateStr, timeStr, location.latitude, location.longitude, local.offset / 60, location.placeName);
    } catch {
      setError(t("tzError"));
    }
  }

  // Default the page to "now" at the default place on first load.
  useEffect(() => {
    handleUseNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const planet = active.id as PlanetName;
    const targetRasi = Number(String(over.id).replace("rasi-", ""));

    setPlacement((prev) => {
      let movedEntry: PlanetSlot | undefined;
      const cleared: Record<number, PlanetSlot[]> = {};
      for (const [rasiKey, slots] of Object.entries(prev)) {
        const rasi = Number(rasiKey);
        cleared[rasi] = slots.filter((s) => {
          if (s.planet === planet) {
            movedEntry = s;
            return false;
          }
          return true;
        });
      }
      if (!movedEntry) return prev;
      cleared[targetRasi] = [...(cleared[targetRasi] ?? []), movedEntry];
      return cleared;
    });
  }

  return (
    <>
      <header>
        <h1>{t("jamakolTitle")}</h1>
        <p className="subtitle">{t("jamakolSubtitle")}</p>
      </header>

      <div className="app-body">
        <p className="jamakol-warning">{t("jamakolWarning")}</p>

        <section className="charts-row">
          {result && chart && (
            <DndContext onDragEnd={handleDragEnd}>
              <div className="jamakol-grid">
                <div className="jamakol-center" style={{ gridRow: "3 / span 2", gridColumn: "3 / span 2" }}>
                  <span>{date.split("-").reverse().join("-")}</span>
                  <span>{time}</span>
                  <span>{placeLabel}</span>
                </div>
                {INNER_GRID_POSITIONS.map(({ rasi, row, col }) => (
                  <RasiCell
                    key={rasi}
                    rasiIndex={rasi}
                    isAscendant={rasi === chart.ascendantRasi}
                    isAarudom={rasi === aarudom?.rasiIndex}
                    aarudomDegree={rasi === aarudom?.rasiIndex ? aarudom?.degree : undefined}
                    isUdayam={rasi === udayam?.rasiIndex}
                    udayamLongitude={rasi === udayam?.rasiIndex ? udayam?.destinationLongitude : undefined}
                    isKavippu={rasi === sooryaVeedhi?.kavippuRasi}
                    kavippuDegree={rasi === sooryaVeedhi?.kavippuRasi ? sooryaVeedhi?.kavippuDegree : undefined}
                    planets={placement[rasi] ?? []}
                    style={{ gridRow: row, gridColumn: col }}
                  />
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
            </DndContext>
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
              {t("dayOfWeek")}
              <input type="text" value={weekdayIndex !== null ? weekdayName(weekdayIndex) : ""} readOnly />
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

          {udayam && import.meta.env.VITE_DEBUG === "true" && (
            <div className="summary">
              <h3>{t("udayamDebugTitle")}</h3>
              <p>{t("udayamS")}: {udayam.S.toFixed(2)}</p>
              <p>{t("udayamD")}: {udayam.D.toFixed(4)}</p>
              <p>{t("udayamDegrees")}: {udayam.degreesForward.toFixed(2)}°</p>
              <p>{t("udayamSunLongitude")}: {udayam.sunLongitude.toFixed(2)}°</p>
              <p>{t("udayamDestination")}: {udayam.destinationLongitude.toFixed(2)}°</p>
              <p>{t("udayamSquare")}: {rasiFullName(udayam.rasiIndex)}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
