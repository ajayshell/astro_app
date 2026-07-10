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

**Udayam marking added** (`web/src/astro/udayam.ts`), per the rule given: S = minutes between the reference time and sunrise (absolute value); D = (sunset − sunrise, in minutes) / 360; degrees-forward = S/D. Two rounds of correction from the first pass:
1. **Starting point.** Originally started from Aries (0°); corrected to start from the **Sun's own current sidereal longitude** instead, then add degrees-forward from there. Verified against a hand-worked example: Sun at 22°42' into Gemini (absolute ~83.66°) + 56.23° forward = 139.89°, landing in **Leo** — correctly skipping past all of Cancer, not just moving "one sign forward," matching the astrologer's own arithmetic.
2. **Direction** (now moot given the starting-point fix, but noted for the record): briefly flipped to a "decreasing sign index" convention based on a visual "looks anti-clockwise" report, then reverted back to the standard increasing-longitude direction once the real issue (starting point, not direction) was identified. Final version uses the same standard direction as every other sidereal position in the app.

**Verification tooling, as requested:** every recalculation prints S, D, degrees-forward, Sun's starting longitude, the destination longitude, and the landed sign to the browser console (prefixed `[Udayam]`), and the same numbers are shown live in a "Udayam calculation (debug)" panel on the page.

**Horoscope page: drag-and-drop disabled.** Planet chips on the Horoscope page (D1/D9/Transit, both chart styles) are no longer draggable — cursor is now a plain default, not a grab hand, and dnd-kit's drag is explicitly disabled rather than just left unwired, so it's a one-line change to bring back if ever wanted. The Jamakol page's inner grid still supports drag-and-drop (not asked to change, left as-is).

**No chart cell needs a scrollbar anymore, verified systematically.** Re-checked every combination of chart style (South/North Indian) × view (Overview, Explore) × divisional chart (D1, D2, D3, D9, D10, D12) for any cell where content overflows its box — all zero. The one remaining case (a South Indian Overview panel cell with two conjunct planets both carrying dignity tags, ~22px short) is now fixed by giving the Overview grid's panels a bit more width and trimming cell padding/chip size slightly. The `overflow: auto` safety net is still there in case a future combination needs it, but nothing currently triggers it.

**Also: the Horoscope page's house numbers (H1, H2...) are back**, behind a "Show house numbers" checkbox above the chart(s) — on by default. Removing them outright (a couple of updates ago) turned out to be a step too far; this keeps both options available.

**Needs the astrologer's sign-off before it's trustworthy, in priority order:**
1. **Jamakol ring + weekday rotation + Maandi + degree meaning** (see above, four sub-items) — highest priority of anything flagged in this doc, since most of it is unconfirmed guesswork rather than a refinement of a known-correct rule.
2. **Soorya Veedhi counting convention** (see above) — inclusive-count-from-1 assumed by analogy with the Aarudom rule, not stated explicitly for Soorya Veedhi itself. Confirm, or provide the exact intended counting style.
3. **Ayanamsa formula** — currently a linear approximation to Lahiri/Chitrapaksha (anchored at J2000, ~50"/year drift), not the full Swiss Ephemeris precession model. Likely accurate to within an arcminute, but should be checked against a few known charts. See `web/src/astro/ayanamsa.ts`.
4. **Remaining divisional charts** — D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60 are not implemented yet. Several (e.g. D3, D7) have more than one traditional counting method — need the astrologer's preferred rule for each before encoding them.
5. **North Indian house orientation** — implemented clockwise from the top; sanity-checked against an Aries-ascendant case (natural sign order should read clockwise) but worth a final visual confirmation.
6. **Lunar node choice** — using the mean lunar node (Rahu/Ketu), not the "true" (osculating) node. Confirm this is the intended convention.
7. **Chara Karaka scheme** — 7-karaka (no nodes), degree-within-sign ranked as-is (no retrograde reversal). Confirm this is the scheme wanted for "Charam", vs. an 8-karaka or reversed-retrograde variant.
8. **Tamil wording** — the Tamil UI strings and the Chara Karaka names in particular (e.g. அமைச்சகாரகன், ஞாதிகாரகன்) are a first-pass transliteration/translation, not reviewed by a Tamil-speaking astrologer. Rasi, nakshatra, and graha names in Tamil are standard/high-confidence; the karaka names and general UI phrasing are the parts worth double-checking.
9. **Exaltation/debilitation scope** — Rahu/Ketu aren't marked Uccha/Neecha since their exaltation sign isn't agreed across traditions (some use Taurus/Scorpio, others Gemini/Sagittarius). Also, dignity/degree in divisional-chart (D9 etc.) and transit views currently reuses the natal (D1) degree, since vargas in this model only resolve to a sign, not their own fractional degree — flag if a varga-specific degree is expected instead.

**Not started (out of v0, but in the agreed v1 scope):** matching/compatibility (synastry), daily predictions. These are the next build phase once the chart math above is validated — no point building predictions on top of a chart engine that hasn't been checked yet.

**Mobile/iPhone pass.** Audited every page (Horoscope Overview and Explore, both chart styles; Jamakol) at realistic phone widths (375px, the current iPhone SE/mini minimum, plus the older 320px iPhone SE 1st-gen as a stress test) using Playwright device emulation, checking for horizontal page overflow, vertical content overflow inside chart cells, iOS's auto-zoom-on-input-focus behavior, and touch target sizing. Found and fixed:
- The South/North Indian chart grids had a `max-width` but no `width: 100%`, so CSS Grid didn't actually shrink to fit narrow viewports — this was the source of horizontal page overflow on every chart page.
- The header (`h1`)/subtitle sizing was tuned for desktop only (60px down to 40px at tablet width) and overflowed/got cut off on a phone; added a 480px breakpoint tier.
- The Overview page's 3-up chart grid (D1/D9/Transit side by side) had a `min-width: 380px` per panel, wider than any phone in portrait — forced to stack full-width below 520px.
- Form inputs/selects were rendering just under 16px on mobile, which triggers iOS Safari's auto-zoom on focus; fixed with an explicit `font-size: 16px` floor on all form controls. Buttons had no real styling (browser defaults only) — gave them proper padding and a 44px minimum touch target.
- Root-caused a subtler bug: `.rasi-cell` didn't set its own `line-height`, so on narrow screens it was inheriting the root's `145%` line-height as a fixed *pixel* value computed at the root's font-size (a well-known CSS quirk — percentage line-heights compute once at the element they're set on, then inherit as a rigid length, not a ratio) — actual content only overflowed further because of that. Also added a phone-only shrink for `.rasi-cell`/`.planet-chip` font size, and consolidated the internal `overflow: auto` scroll-fallback into the base `.rasi-cell` rule everywhere (previously scoped to the Overview grid only), so any cell with several conjunct planets degrades to a scrollable cell rather than a broken layout.
- The Jamakol page's inner 4x4 D1 mini-chart shares the same `.rasi-cell` component but at roughly half the cell size of the main chart (a 6x6 ring grid squeezed into phone width), so the standard shrink wasn't enough — cells with 2 conjunct planets or a dignity tag were overflowing by up to 34px even after the general fix. Added a Jamakol-specific mobile rule that shrinks further and hides the per-planet degree/dignity-tag lines (already shown in full on the Overview page, so not lost information) — down to zero overflowing cells at 375px, with only rare 2-planet-conjunction cells still needing the scroll fallback at the older 320px width.

Verified clean (0 elements horizontally overflowing, 0 chart cells needing the scroll fallback) at 375px across every page/mode/chart-style combination; at the legacy 320px width, a handful of cells with 2-3 conjunct planets plus tags still fall back to internal scrolling by design rather than breaking the layout.

**Soorya Veedhi marking added** (`web/src/astro/sooryaVeedhi.ts`), per the rule in `web/rules/soorya_veedhi.txt`. The 12 rasis split into three groups of four — Rishaba/Mithuna/Kadaga/Simha ("mesha veedhi"), Kanni/Thula/Meena/Mesha ("rishaba raasi"), Virchigam/Dhanush/Magara/Kumba ("mithuna veedhi") — each group mapping to a target sign (Mesha, Rishaba, Mithuna respectively; this is a clean partition, every rasi appears in exactly one group). Natal Surya's rasi picks the group and its target; counting clockwise from Aarudom's rasi to that target gives the Soorya Veedhi Count (SVC); counting clockwise from Udayam's rasi by SVC squares lands on the square marked **Kavippu** (red label) on the inner D1 grid.

**Flagged assumption:** the rule text doesn't say whether the starting sign counts as 1 or 0 in either "count from X clockwise to/for N" step. Reused the one counting convention this app already has explicit confirmation for — the Aarudom rule's own "starting sign = count 1, inclusive" — for both counting steps here. If Soorya Veedhi is meant to count exclusively (0 steps from the start sign) instead, the result would land one square earlier each time; flag if so. Worked example, self-consistent with the app's own Aarudom/Udayam output for 1979-06-29 08:21 Bengaluru: Surya in Gemini (Mithuna) → group 1 → target Mesha; Aarudom = Leo; SVC = 9 (Leo→Mesha clockwise inclusive); Udayam = Leo; Kavippu = Leo + 9 - 1 = Mesha (Aries).
