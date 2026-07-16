// Quick-test buttons shown above the Jamakol chart in debug mode
// (`npm run dev:debug`, or `./runserver.sh --debug` from the repo root).
// Each entry becomes a button; clicking it fills in date/time/place and
// regenerates the chart immediately -- no manual form-filling needed to
// re-check a specific example while iterating on a rule.
//
// `cityId` is a data/cities.ts `City.id` (a GeoNames id). To find one for a
// new place: grep '"CityName"' src/data/cities.ts and copy its `id`.
export interface DebugPreset {
  label: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm:ss"
  cityId: string;
}

export const DEBUG_PRESETS: DebugPreset[] = [
  {
    label: "Sat 7:12pm -- Baytown, TX (rule's worked example)",
    date: "2024-01-06",
    time: "19:12:00",
    cityId: "4672731",
  },
  {
    label: "Sat 7:51pm -- Baytown, TX",
    date: "2026-07-11",
    time: "19:51:00",
    cityId: "4672731",
  },
  {
    label: "Tue 11:39:38am -- Krishnagiri, TN",
    date: "2026-07-14",
    time: "11:39:38",
    cityId: "1265863",
  },
  {
    label: "Sun 4:56pm -- Chennai, TN",
    date: "2026-07-12",
    time: "16:56:00",
    cityId: "1264527",
  },
  {
    label: "Sun 11:14:16am -- Krishnagiri, TN",
    date: "2026-07-12",
    time: "11:14:16",
    cityId: "1265863",
  },
  {
    label: "Tue 11:14:16am -- Krishnagiri, TN",
    date: "2026-07-14",
    time: "11:14:16",
    cityId: "1265863",
  },
];
