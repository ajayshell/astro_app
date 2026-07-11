# Astro Raasi Horoscope — App Design & Rules Reference

Internal reference: how the app is structured, and a per-feature summary
of every astrological rule this codebase implements, with its
confirmed/unconfirmed status. Not linked from the running app (it exposes
calculation detail that `docs/USER_GUIDE.md` deliberately omits).

For the full chronological build history, worked examples, and edge-case
discussion behind each rule below, see `PROJECT_BRIEF.md` — this doc is a
reorganized-by-feature summary of that history, not a replacement for it.

---

## Part 1: App structure

### Pages and navigation

Two pages, switched via a tab bar (`App.tsx`): **Horoscope** and
**Jamakol**. Each is a full React component that mounts/unmounts on tab
switch (not a persistent DOM tree) — so any state that needs to survive a
tab switch has to live above this switch, not inside either page.

### Shared state (survives tab switches)

- **`context/BirthDetailsContext.tsx`** — date, time, place (`cityId` or
  custom lat/long). Both pages' forms read and write this same state, so
  picking a date/time/place on either page carries over to the other.
  Seeded with a fixed default (16-04-1974, 10:04, Bengaluru — id
  `"1277333"`) rather than each page defaulting independently. `cityId`
  is a stable unique id (see "Cities/place data" below), not a name.
- **`context/CitiesContext.tsx`** — the ~24k-entry city list, loaded once
  via a dynamic `import()` and shared so both pages' forms use one fetch,
  not two. `cities` is `null` until loaded; both forms gate their
  auto-generate-on-mount effect and disable the place selects on that.
- **`i18n/LanguageContext.tsx`** — the English/Tamil toggle, app-wide.
  Exposes helpers (`t()`, `rasiLabel()`, `planetName()`, `planetAbbr()`,
  `nakshatraName()`, `karakaName()`, `weekdayName()`, `ascendantMarker()`)
  so every page/component pulls translated strings the same way rather
  than each maintaining its own English/Tamil branching.

### Page-local state (does not survive tab switches)

Everything else: chart style (South/North Indian), view mode
(Overview/Explore), which divisional chart is selected, house-number
toggle, the computed chart/dasha/Jamakol results themselves. These reset
to their defaults each time a page is (re)mounted.

### Chart rendering

One shared chart-math engine (`astro/charts.ts`, `astro/ascendant.ts`,
`astro/dignity.ts`, etc.) feeds two interchangeable renderers —
`SouthIndianChart` and `NorthIndianChart` — both consuming the same
`RasiCell`/`PlanetChip` components, so a fix or feature added to one
chart style automatically applies to the other. The Jamakol page's inner
4×4 grid reuses `RasiCell` directly, positioned inside its own larger 6×6
ring layout (`SOUTH_INDIAN_GRID_POSITIONS`, shifted by one row/column).

### Mobile

Deliberately audited/tuned as its own pass (not incidental) — see
PROJECT_BRIEF.md's "Mobile/iPhone pass" section. Conventions worth
keeping for new UI: 16px minimum on form inputs (iOS zoom-on-focus), a
480px breakpoint for font/padding shrink, `overflow: auto` as a last-resort
fallback on any cell that might overflow rather than letting content spill
out visibly.

### Cities/place data

`web/src/data/cities.ts` (~24k entries, generated, do not hand-edit) is
sourced from the `all-the-cities` npm package (devDependency only, never
shipped to the browser), itself derived from GeoNames.org. Regenerate via
`node scripts/generate-cities.cjs` after changing the population threshold
or the `all-the-cities` version. State/province names come from GeoNames'
own `admin1CodesASCII.txt` (checked in at `web/scripts/`, same source
system as the city data so codes always line up), with a small hand-list
fallback for the ~130 entries (0.5%) that reference an admin code the
current reference file no longer lists separately (e.g. two Indian union
territories merged in 2020).

Two things this scale of data required that a small hand-picked list
didn't:
- **Selection by id, not name.** ~24k entries have hundreds of duplicate
  names (multiple "Raipur"s, "San Pedro"s, etc.) — every city carries a
  stable unique `id` (GeoNames' own city id), and that's what
  `BirthDetailsContext`'s `cityId` and every lookup use, never `name`.
- **Lazy loading.** `context/CitiesContext.tsx` dynamically `import()`s
  `data/cities.ts` once at app root (its own code-split chunk, several
  hundred KB gzipped) instead of bundling it into the main entry — keeps
  first paint fast. `cities` is `null` until it resolves; forms disable
  the place selects and defer their auto-generate-on-mount effect on that.

**Place input is three cascading `<select>`s (Country → State → City),
not one flat list** — `components/PlaceSelector.tsx`, shared by both
pages' forms. A single `<select>` with all ~24k options is slow to
*render as DOM* regardless of how fast the data loads/how good the
underlying list is; cascading keeps each select's option count bounded
(at most a few hundred — the single biggest state/country group in the
data is ~650 cities) no matter the full list's size. Country/State
selections are local component state, re-derived from whichever city is
actually selected (`cityId`, shared) whenever it changes — so switching
tabs or loading the default correctly repopulates all three levels.

### Timezone / DST

Every birth-time-to-UTC conversion goes through `astro/timezone.ts`
(`tz-lookup` for the IANA zone from coordinates, then Luxon for the UTC
offset *at that specific date*) — never a hardcoded or "current" offset.
Verified against a real historical rule change: the US Energy Policy Act
of 2005 (effective 2007) extended DST; `2006-10-29` resolves to UTC−8 in
`America/Los_Angeles` (old rule, DST already ended), while the same
calendar date a year later resolves to UTC−7 (new rule, still DST).

### User guide rendering

`docs/USER_GUIDE.md` is the single source of truth for the in-app "User
guide" page — no duplicated content. `pages/UserGuidePage.tsx` imports it
via Vite's `?raw` import (works across the `astro_app/` → `web/` boundary
with no config changes) and renders it client-side with `marked`. `App.tsx`
treats `"userGuide"` as a third `Page` value that hides the Horoscope/
Jamakol tab bar while active.

### Tests

`web/test/astro/` (Vitest — `npm test` to run once, `npm run test:watch`
for dev). Covers the calculation engine specifically (`astro/*.ts`), not
UI/components, since that's where this codebase's actual bug history is:
the Ascendant 180° flip, the Udayam starting-point correction, several
Aarudom/Soorya Veedhi boundary cases. Each of those has a permanent
regression test now instead of a one-off hand-verification. Notably,
`charts.test.ts` runs the exact 1979-06-29 08:21 Bengaluru chart the
astrologer used to catch the Ascendant bug and asserts the Ascendant is
Cancer — if that test ever fails, the fix has regressed.

Type-checked as part of `npm run build` too (`tsconfig.test.json`, wired
into the root `tsconfig.json`'s project references) — a type error in a
test is still a build failure, not something that silently slips through.

**Pre-push hook (opt-in, one-time setup):** `astro_app/.githooks/pre-push`
runs the full suite before every `git push` and blocks the push on
failure. Not enabled by default (setting `core.hooksPath` is a git config
change, left for each developer to opt into deliberately rather than
silently altered by tooling) — run once per clone:
```
git config core.hooksPath astro_app/.githooks
```
Bypass a single push with `git push --no-verify` if genuinely needed.

Not covered yet: UI/component tests, and the Jamakol ring/degree logic
(deliberately, since that rule itself is still unconfirmed — see "Rules we
created" above; a test would just encode a guess as if it were settled).

### Debug/dev-only tooling

Gated behind the `VITE_DEBUG` env var (off by default, including in
production builds) rather than removed outright — see `astro/udayam.ts`
and `JamakolPage.tsx`. Run `VITE_DEBUG=true npm run dev` (or
`VITE_DEBUG=true ./runserver.sh`) locally to see it.

---

## Part 2: Rules we created

Every astrological rule below was supplied incrementally by the
astrologer (often refined over several rounds) rather than assumed from a
generic textbook — except where explicitly noted as a standard/common
convention. **"Confirmed" means the astrologer has explicitly signed off
on this exact rule; "not yet confirmed" means it's implemented and
in-app, but still open for correction.**

### Core chart engine — confirmed
- Sidereal zodiac (Lahiri ayanamsa, linear approximation — not the full
  Swiss Ephemeris precession model; likely accurate to within an
  arcminute but not independently verified against known charts).
- Whole-sign houses, Ascendant via `atan2` (a real bug — an off-by-180°
  error — was caught and fixed here; every chart before that fix had a
  wrong Ascendant and wrong houses).
- Divisional charts implemented: D1, D2, D3, D9, D10, D12. Not yet
  implemented: D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60.
- Vimshottari Dasha, 3 levels deep (Dasha/Bhukti/Antharam), standard
  proportional-duration rule applied recursively.
- Chara Karaka (Charam): 7-karaka scheme (Sun–Saturn, no nodes),
  degree-within-sign ranking, no retrograde reversal — **not yet
  confirmed** this is the intended scheme vs. an 8-karaka or
  reversed-retrograde variant.
- Exaltation/debilitation (Uccha/Neecha): classical Parashari signs for
  the 7 classical grahas. Rahu/Ketu excluded (their exaltation sign isn't
  agreed across traditions).
- Lunar nodes: mean node, not true/osculating — **not yet confirmed**
  this is the intended convention.

### Jamakol ring — partially confirmed
- **Confirmed**: anti-clockwise ring order Surya→Chevva→Guru→Budhan→
  Shukran→Shani→Chandran→Maandi; on a Sunday, Surya sits in the top-left
  box.
- **Not confirmed**: how the ring's starting box rotates for the other
  six weekdays (a reference chart for a Thursday didn't fit any simple
  weekday-shift rule tried) — the ring currently always starts at Surya
  regardless of weekday. Also unconfirmed: Maandi's real calculated
  position (currently a label only, no upagraha math behind it), and the
  meaning of the "degree" shown per ring box.

### Aarudom — confirmed (degree-based version)
`Ad = minutes of the reference time × 6` (degrees). Starting from
Mesham, subtract 30° from Ad for each square traversed (Mesham counts as
the first); the sign landed on is Aarudom's rasi, the remainder is its
degree. This replaced an earlier divide-by-5/count-signs version — the
two agree except at exact multiples of 5 minutes, where this version
advances to the next sign at 0° instead of staying in the previous sign
(**not yet re-confirmed** that this specific boundary behavior is
correct, though the overall degree-based rule is confirmed).

### Udayam — confirmed
`S` = minutes between reference time and sunrise. `D` = (sunset −
sunrise in minutes) / 360. Degrees-forward = S/D. Starting point is the
Sun's own sidereal longitude (not Aries 0°) — add degrees-forward to get
Udayam's landed sign and degree.

### Soorya Veedhi / Kavippu — confirmed
12 rasis split into 3 groups of 4 (confirmed against a reference table
image, matches exactly): Rishaba/Mithuna/Kadaga/Simha → target Mesha;
Kanni/Thula/Meena/Mesha → target Rishaba; Virchigam/Dhanush/Magara/Kumba
→ target Mithuna. Natal Surya's rasi picks the group; count clockwise
(inclusive) from Aarudom to that group's target sign = Soorya Veedhi
Count (SVC). Count clockwise (inclusive) from Udayam by SVC squares →
that square is marked Kavippu. Kavippu's degree = 30 − Aarudom's degree.

### Rahukalam / Yamakandam / Gulikaal — implemented, not yet confirmed
Sunrise-to-sunset split into 8 equal segments; which segment is used per
period depends on the weekday, per the table below (the standard rule
used consistently across Panchangam references — implemented directly
rather than left blank, since unlike the Jamakol ring it's uniform across
every source checked, but **not yet specifically confirmed by this
app's astrologer**):

```
         Sun  Mon  Tue  Wed  Thu  Fri  Sat
Rahu      8    2    7    5    6    4    3
Yama      5    4    3    2    1    7    6
Gulika    7    6    5    4    3    2    1
```

Daytime-only; a nighttime Gulikaal variant is not implemented and not
yet decided on.

### Tamil translations — first pass, not reviewed
Rasi/nakshatra/graha names: standard, high confidence. Chara Karaka
names and general UI phrasing/register: first-pass translation, worth a
Tamil-speaking astrologer's review. Planet chart-grid abbreviations
(e.g. சூர் for Sun) are ad hoc truncations of the full names, not a
verified conventional Tamil astrology abbreviation set.
