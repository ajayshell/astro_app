# Astrology App — Brief for Astrologer Consultation

## Platform
Single codebase, browser + mobile (web app, installable on phones). Not native iOS/Android code.

Stack in use: React + TypeScript (Vite), computed client-side. Planetary positions come from `astronomy-engine` (a pure JS/TS ephemeris library, no WASM/native build step — chosen over Swiss Ephemeris for this prototype specifically for that portability). Capacitor wrapping for app-store distribution is still a good option later but not done yet.

## Chart style
User-selectable — South Indian (square, fixed houses) and North Indian (diamond) layouts, same underlying data.

## Charts required
- Rasi (D1) chart
- All divisional charts (Navamsa/D9, Dashamsa/D10, Hora/D2, Drekkana/D3, etc. — full set)
- Bhava charts

## Dasha system
Vimshottari.

## House system
Whole sign.

## Inputs
Date of birth, time, place → compute chart (planetary positions sourced via Swiss Ephemeris / JPL-grade data).

## V1 feature scope
1. Birth chart generation (all divisional + bhava charts, both regional styles)
2. Matching/compatibility (synastry between two charts)
3. Transits (current planetary positions vs. natal chart)
4. Daily predictions

Note: all four of the above are in scope for v1 — not a narrow "birth chart only" start.

## UI
Editable via buttons and drag-and-drop (e.g., repositioning planets/labels on the chart). Logic and rules to be defined by astrologer; UI/interaction handled by engineering.

---

## Build status (prototype, v0)

Code lives in `astro_app/web` (React + TypeScript + Vite). Run with `npm install && npm run dev` from that folder.

**Working end-to-end:**
- Birth-details form: date, time, place (curated South Indian/major-city list + custom lat/long), correct historical time-zone resolution (`tz-lookup` + `luxon`, not just today's offset).
- Sidereal chart engine: geocentric tropical planetary longitudes (`astronomy-engine`) → Lahiri ayanamsa → sidereal longitudes, Ascendant/Lagna, whole-sign houses, nakshatra + pada per planet, retrograde detection.
- Divisional charts implemented: **D1 (Rasi), D2 (Hora), D3 (Drekkana), D9 (Navamsa), D10 (Dashamsa), D12 (Dwadashamsa)** — selectable from the UI.
- Chart rendering: both **South Indian** (fixed 4x4 grid) and **North Indian** (diamond, house-based) styles, toggle between them.
- Drag-and-drop: planet chips can be dragged between houses in either chart style (touch + mouse, via `dnd-kit`) — for testing alternate placements; not persisted anywhere yet.
- Vimshottari dasha: full mahadasha sequence with nested antardashas, computed from the Moon's nakshatra position at birth.
- Verified running end-to-end in a real browser (Chromium), including the drag interaction.

**Also since the last update:**
- Forced light theme (the app no longer follows the OS/browser dark-mode preference).
- Named horoscopes: a "Name" field on the form, defaulting to "Aj", shown in the page header ("Aj's Horoscope").
- Default birth details on load: 1979-06-29, 08:21, Bengaluru — the chart auto-generates on first load instead of starting blank.
- **Overview page**: shows Rasi (D1), Navamsa (D9), and Transit (Gochara) side by side at once (new default view). Transit = current planetary positions computed for "now", read against the natal houses (the conventional Gochara reading). An "Explore a single divisional chart" mode is still available for stepping through any implemented varga one at a time.
- **Charam (சரம்)** section below the chart: Jaimini Chara Karakas (Atmakaraka down to Darakaraka), ranked by each planet's degree within its sign. Uses the common modern 7-karaka scheme (Sun-Saturn, no nodes) — flagged in-app since some traditions use an 8-karaka scheme with Rahu, or reverse the ranking for retrograde planets.
- **Tamil language toggle** — a "Language / மொழி" dropdown, top-right, switches all UI text, rasi/nakshatra/planet/karaka names, and chart labels between English and Tamil. Ascendant is marked "As" in English, "La" (Lagna) in Tamil.
- **Nakshatra column** in the planet table now shows the nakshatra name (English or Tamil), not its numeric index.
- **South Indian chart** now draws the traditional crossed diagonals through the unused center block (North Indian already had its own corner-to-corner diagonals).
- Visual pass: bumped font sizes up a step, gave the sidebar cards a warmer bordered/shadowed look with bold section headings, switched the page to a light cream/yellow background, and fixed a header/subtitle spacing bug where the two lines overlapped.
- **Each planet chip in the chart grid now shows its degree**, plus a small tag when applicable: **Uccha** (exalted), **Neecha** (debilitated), or **Retro**. Dignity is computed from the classical Parashari exaltation/debilitation sign for each of the 7 classical grahas (Rahu/Ketu excluded — see below). Chart cells scroll internally rather than clip if several planets are conjunct and don't all fit.

**Needs the astrologer's sign-off before it's trustworthy, in priority order:**
1. **Ayanamsa formula** — currently a linear approximation to Lahiri/Chitrapaksha (anchored at J2000, ~50"/year drift), not the full Swiss Ephemeris precession model. Likely accurate to within an arcminute, but should be checked against a few known charts. See `web/src/astro/ayanamsa.ts`.
2. **Remaining divisional charts** — D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60 are not implemented yet. Several (e.g. D3, D7) have more than one traditional counting method — need the astrologer's preferred rule for each before encoding them.
3. **North Indian house orientation** — implemented clockwise from the top; sanity-checked against an Aries-ascendant case (natural sign order should read clockwise) but worth a final visual confirmation.
4. **Lunar node choice** — using the mean lunar node (Rahu/Ketu), not the "true" (osculating) node. Confirm this is the intended convention.
5. **Chara Karaka scheme** — 7-karaka (no nodes), degree-within-sign ranked as-is (no retrograde reversal). Confirm this is the scheme wanted for "Charam", vs. an 8-karaka or reversed-retrograde variant.
6. **Tamil wording** — the Tamil UI strings and the Chara Karaka names in particular (e.g. அமைச்சகாரகன், ஞாதிகாரகன்) are a first-pass transliteration/translation, not reviewed by a Tamil-speaking astrologer. Rasi, nakshatra, and graha names in Tamil are standard/high-confidence; the karaka names and general UI phrasing are the parts worth double-checking.
7. **Exaltation/debilitation scope** — Rahu/Ketu aren't marked Uccha/Neecha since their exaltation sign isn't agreed across traditions (some use Taurus/Scorpio, others Gemini/Sagittarius). Also, dignity/degree in divisional-chart (D9 etc.) and transit views currently reuses the natal (D1) degree, since vargas in this model only resolve to a sign, not their own fractional degree — flag if a varga-specific degree is expected instead.

**Not started (out of v0, but in the agreed v1 scope):** matching/compatibility (synastry), daily predictions. These are the next build phase once the chart math above is validated — no point building predictions on top of a chart engine that hasn't been checked yet.
