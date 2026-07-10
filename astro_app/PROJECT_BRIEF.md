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

**New page: Jamakol Chart** (`web/src/astro/jamakol.ts`, `web/src/pages/JamakolPage.tsx`). Divides the day (sunrise to next sunrise) into 8 jamams — 4 across daytime, 4 across the night — drawn as an outer ring of 8 boxes (the 4 corners + 4 edge positions of a 6x6 grid) surrounding a separate inner 4x4 area, with a 2x2 center block showing date/time/place. The inner 4x4 area now shows the actual **D1 Rasi chart** (sign + planets + degree + dignity tags + Ascendant marker) for the selected date/time/place, reusing the same chart engine and drag-and-drop as the Horoscope page — it's no longer blank. Inner-cell borders are black for contrast against the ring. The ring is read anti-clockwise starting from the top-left box. Has its own date/time/place inputs plus a "use current time" button, defaults to the current moment at Bengaluru on load, and highlights the jamam containing the selected moment.

**Reworked from a reference screenshot; here's exactly what's confirmed vs. guessed, since this is the piece of logic I'm least confident about in the whole app:**
- **Confirmed** (from the screenshot + the explicit rule given): the anti-clockwise ring order is Surya (Sun), Chevva (Mars), Guru (Jupiter), Budhan (Mercury), Shukran (Venus), Shani (Saturn), Chandran (Moon), Maandi — 7 classical grahas plus the upagraha Maandi, no Rahu/Ketu in this chart. On a Sunday, Surya sits in the top-left box (the jamam right after sunrise).
- **Not confirmed — flagged with a warning banner on the page itself:**
  1. *How the ring rotates for the other six weekdays.* The reference screenshot was for a Thursday and showed **Maandi**, not Surya, in the top-left box. I checked: no simple "shift the start by weekday index" rule produces both the Sunday rule I was given and that Thursday result — so I didn't guess one. The app currently always starts the ring at Surya regardless of weekday; treat any non-Sunday chart as provisional until you give me the actual per-weekday rule.
  2. *Maandi's position (in the ring).* Maandi/Gulika is normally a real calculated upagraha (a time-of-day-dependent point), not just a label. Right now it's placed as the 8th ring slot with no astronomical computation behind it.
  3. *The meaning of the "degree" shown in each ring box.* The reference screenshot shows values like "315.3", "0.3", "45.3" — 45-degree steps with a mysterious ".3". I don't know what that fractional part represents (a real ephemeris degree? a rounding artifact? something else?), so this build just shows plain 45-degree-step labels (0°, 45°, 90°...) with no claim they mean the same thing as the reference app's numbers.
  4. *Whether the D1 chart is actually what belongs in the inner 4x4.* You confirmed the inner area should show "horoscope information... as done in the previous tab," which I've taken to mean the D1 Rasi chart specifically — flag if a different divisional chart or a different set of sub-details (the reference screenshot's cells looked more like nakshatra-pada-style sub-values than a plain D1 chart) was actually intended.

**Aarudom marking added** (`web/src/astro/aarudom.ts`), per the rule given: take the reference time's minutes, divide by 5 (round up if there's a remainder) to get a count, then count that many signs clockwise from Aries (Aries itself = count 1); the sign landed on is marked "Aarudom" (purple label) on the inner D1 chart. Verified against the worked example in the rule (count 6 → lands on Virgo). One edge case the stated rule doesn't cover: at exactly :00 minutes, the count comes out to 0, which has no defined sign — this build treats that as a full 12-sign wrap back to Aries rather than leaving it undefined; flag if a different behavior is intended for that specific case.

While building this I also caught and fixed a real timezone-display bug: sunrise/sunset/jamam times were initially rendered in the *browser's* local timezone rather than the chart location's, which silently produced nonsense (e.g. "sunrise at 5:29 PM") whenever the browser's system timezone didn't match the chart's location — now all times are explicitly formatted in the location's own IANA timezone.

**Udayam marking added** (`web/src/astro/udayam.ts`), per the rule given: S = minutes between the reference time and sunrise (absolute value); D = (sunset − sunrise, in minutes) / 360; move S/D degrees clockwise from Aries, 30 degrees per sign, and mark that sign "Udayam" (teal label) on the inner D1 chart. The rule's wording was slightly ambiguous about whether to move "D degrees" or "S/D degrees" forward — I went with S/D since that's the only reading that uses both defined quantities together; flag if D alone (or some other combination) was actually meant. **Verification tooling, as requested:** every recalculation prints S, D, degrees-forward, and the landed sign to the browser console (prefixed `[Udayam]`), and the same numbers are shown live in a "Udayam calculation (debug)" panel on the page — check both while testing different times. Worked through the 8:30 AM example by hand against the app's own output and the arithmetic is self-consistent (S=150.36 min, D=2.1407 min/deg, 70.24° forward → Gemini) — but "self-consistent" only proves the code matches this reading of the rule, not that the reading itself is correct astrologically.

**Also: the Horoscope page's house numbers (H1, H2...) are back**, behind a "Show house numbers" checkbox above the chart(s) — on by default. Removing them outright (a couple of updates ago) turned out to be a step too far; this keeps both options available.

**Needs the astrologer's sign-off before it's trustworthy, in priority order:**
1. **Jamakol ring + weekday rotation + Maandi + degree meaning** (see above, four sub-items) — highest priority of anything flagged in this doc, since most of it is unconfirmed guesswork rather than a refinement of a known-correct rule.
2. **Ayanamsa formula** — currently a linear approximation to Lahiri/Chitrapaksha (anchored at J2000, ~50"/year drift), not the full Swiss Ephemeris precession model. Likely accurate to within an arcminute, but should be checked against a few known charts. See `web/src/astro/ayanamsa.ts`.
3. **Remaining divisional charts** — D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60 are not implemented yet. Several (e.g. D3, D7) have more than one traditional counting method — need the astrologer's preferred rule for each before encoding them.
4. **North Indian house orientation** — implemented clockwise from the top; sanity-checked against an Aries-ascendant case (natural sign order should read clockwise) but worth a final visual confirmation.
5. **Lunar node choice** — using the mean lunar node (Rahu/Ketu), not the "true" (osculating) node. Confirm this is the intended convention.
6. **Chara Karaka scheme** — 7-karaka (no nodes), degree-within-sign ranked as-is (no retrograde reversal). Confirm this is the scheme wanted for "Charam", vs. an 8-karaka or reversed-retrograde variant.
7. **Tamil wording** — the Tamil UI strings and the Chara Karaka names in particular (e.g. அமைச்சகாரகன், ஞாதிகாரகன்) are a first-pass transliteration/translation, not reviewed by a Tamil-speaking astrologer. Rasi, nakshatra, and graha names in Tamil are standard/high-confidence; the karaka names and general UI phrasing are the parts worth double-checking.
8. **Exaltation/debilitation scope** — Rahu/Ketu aren't marked Uccha/Neecha since their exaltation sign isn't agreed across traditions (some use Taurus/Scorpio, others Gemini/Sagittarius). Also, dignity/degree in divisional-chart (D9 etc.) and transit views currently reuses the natal (D1) degree, since vargas in this model only resolve to a sign, not their own fractional degree — flag if a varga-specific degree is expected instead.

**Not started (out of v0, but in the agreed v1 scope):** matching/compatibility (synastry), daily predictions. These are the next build phase once the chart math above is validated — no point building predictions on top of a chart engine that hasn't been checked yet.
