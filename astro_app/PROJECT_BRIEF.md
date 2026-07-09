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
- Planet chips redrawn as a circle with the degree and Uccha/Neecha/Retro tags shown below/outside the circle, not stretching it into an oval.

**Fixed: Ascendant (Lagna) was 180 degrees off.** The astrologer caught this directly: for the 1979-06-29 08:21 Bengaluru chart, the app was placing Lagna where it should have placed the 7th-house cusp (Capricorn instead of the correct Cancer). Root cause was in the Ascendant formula (`web/src/astro/ascendant.ts`) — the `atan2` solution resolves the right *line* through the ecliptic but doesn't reliably pick Ascendant over Descendant (they're 180 degrees apart and satisfy the same tangent equation); the code needed an explicit `+ 180` to land on the correct one. This is a **major correctness fix** — every chart generated before this fix had ascendant, and therefore every whole-sign house, wrong. Please spot-check a couple more known charts against this build to confirm it now holds generally.

**Chart grid, redesigned per feedback:**
- Removed house numbers (H1, H2...) from every cell — signs/houses are identified by sign name and the As/La marker only.
- Planet names are now plain colored text (no circular badge); a subtle green/red tint marks Uccha/Neecha on the name itself, in addition to the tag below it.
- The South Indian chart's decorative center cross (added last round) is gone — the center block now shows the birth date, time, and place instead, matching how many real South Indian charts caption themselves.
- Charts are drawn much larger, and cells no longer clip conjunct planets in the normal case. A cell can still scroll internally as a last resort in the tightest context (the 3-up Overview grid with several conjunct + retrograde + debilitated planets stacked in one sign) rather than let content spill outside the chart entirely — that spillover was a real bug caught while implementing this, now fixed.

**Vimshottari Dasha now goes 3 levels deep: Dasha / Bhukti / Antharam** (Mahadasha / Antardasha / Pratyantardasha), each level labeled and progressively indented, expand/collapse per row. Same proportional-duration rule applied recursively at each level.

**New: multi-page structure with a tab bar** (Horoscope / Jamakol), since the app is expected to grow more pages. Each page owns its own state (birth chart pages don't share input state with the Jamakol page).

**New page: Jamakol Chart** (`web/src/astro/jamakol.ts`, `web/src/pages/JamakolPage.tsx`). Divides the day (sunrise to next sunrise) into 8 jamams — 4 across daytime, 4 across the night, each ruled by a graha — and highlights whichever jamam contains the selected moment. Has its own date/time/place inputs plus a "use current time" button, and defaults to the current moment at Bengaluru on load.

**This is the one piece of new logic in this build I could not verify against a known reference, and it needs astrologer review before anyone relies on it.** I implemented Jamakol using the mechanics of the Western planetary-hours system (jamam 1 after sunrise = that weekday's lord; subsequent jamams cycle through the Chaldean order Saturn→Jupiter→Mars→Sun→Venus→Mercury→Moon, continuing through the night) because that's the closest documented analogue I have real confidence in — but I do not have a confirmed source for the actual Jamakol rule the astrologer uses. If Jamakol instead uses a fixed (non-rotating) lord-per-jamam-number table, or restarts the cycle at sunset instead of continuing through it, the output here will be wrong. The page carries a visible warning banner saying so; please don't treat it as correct until checked.

While building this I also caught and fixed a real timezone-display bug: sunrise/sunset/jamam times were initially rendered in the *browser's* local timezone rather than the chart location's, which silently produced nonsense (e.g. "sunrise at 5:29 PM") whenever the browser's system timezone didn't match the chart's location — now all times are explicitly formatted in the location's own IANA timezone.

**Needs the astrologer's sign-off before it's trustworthy, in priority order:**
1. **Jamakol calculation rule** (see above) — highest priority of anything flagged in this doc, since it's a complete guess at an unconfirmed traditional system, not a refinement of a known-correct one.
2. **Ayanamsa formula** — currently a linear approximation to Lahiri/Chitrapaksha (anchored at J2000, ~50"/year drift), not the full Swiss Ephemeris precession model. Likely accurate to within an arcminute, but should be checked against a few known charts. See `web/src/astro/ayanamsa.ts`.
3. **Remaining divisional charts** — D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60 are not implemented yet. Several (e.g. D3, D7) have more than one traditional counting method — need the astrologer's preferred rule for each before encoding them.
4. **North Indian house orientation** — implemented clockwise from the top; sanity-checked against an Aries-ascendant case (natural sign order should read clockwise) but worth a final visual confirmation.
5. **Lunar node choice** — using the mean lunar node (Rahu/Ketu), not the "true" (osculating) node. Confirm this is the intended convention.
6. **Chara Karaka scheme** — 7-karaka (no nodes), degree-within-sign ranked as-is (no retrograde reversal). Confirm this is the scheme wanted for "Charam", vs. an 8-karaka or reversed-retrograde variant.
7. **Tamil wording** — the Tamil UI strings and the Chara Karaka names in particular (e.g. அமைச்சகாரகன், ஞாதிகாரகன்) are a first-pass transliteration/translation, not reviewed by a Tamil-speaking astrologer. Rasi, nakshatra, and graha names in Tamil are standard/high-confidence; the karaka names and general UI phrasing are the parts worth double-checking.
8. **Exaltation/debilitation scope** — Rahu/Ketu aren't marked Uccha/Neecha since their exaltation sign isn't agreed across traditions (some use Taurus/Scorpio, others Gemini/Sagittarius). Also, dignity/degree in divisional-chart (D9 etc.) and transit views currently reuses the natal (D1) degree, since vargas in this model only resolve to a sign, not their own fractional degree — flag if a varga-specific degree is expected instead.

**Not started (out of v0, but in the agreed v1 scope):** matching/compatibility (synastry), daily predictions. These are the next build phase once the chart math above is validated — no point building predictions on top of a chart engine that hasn't been checked yet.
