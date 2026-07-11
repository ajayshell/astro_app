# Astro Raasi Horoscope — User Guide

A South Indian-style Vedic astrology app. Enter a birth date, time, and
place, and it draws the birth chart, dasha timeline, and a Jamakol chart,
in English or Tamil.

This guide describes what each feature does and how to use it. For
technical/implementation detail, see the project's internal documentation
(not part of this guide).

---

## Getting around

The app has two tabs at the top: **Horoscope** and **Jamakol**. Switch
between them any time — the date, time, and place you've entered are
shared between both tabs, so you only need to enter them once.

- **Language**: top-right dropdown, switches all text (including sign,
  planet, and nakshatra names) between English and Tamil.
- **Contact us**: top-left badge — click it to email support with
  questions or feedback.
- **User guide**: next to Contact us — this page. Use **← Back to home**
  to return to the app.

---

## Horoscope tab

### Birth details

Enter a name (for your own reference), date of birth, time of birth, and
place of birth — pick a **Country**, then **State/Province**, then
**City/Town** (covers tens of thousands of places worldwide, down to
small towns), or choose Custom coordinates for anywhere not listed. Click
**Generate chart** to draw the chart. The app also draws a default
example chart automatically so the page isn't empty on first load.

### Chart style

Choose between:
- **South Indian**: the traditional fixed-grid square chart, where each
  square always represents the same zodiac sign no matter where the
  ascendant falls.
- **North Indian**: the traditional diamond-shaped chart, where the first
  house (ascendant) is always the top diamond and the rest follow around
  it.

Both show the same underlying chart — it's purely a style preference.

A **Show house numbers** checkbox toggles the H1, H2, ... house-number
labels on or off in either style.

### Viewing the chart

Two view modes:
- **Overview** (default): shows three charts side by side — the natal
  Rasi chart (D1), the Navamsa chart (D9), and current Transits (Gochara,
  today's planetary positions read against your natal houses).
- **Explore a single divisional chart**: step through any one divisional
  chart at a time (Rasi D1, Hora D2, Drekkana D3, Navamsa D9, Dashamsa
  D10, or Dwadashamsa D12) at a larger size.

### Reading a chart square

Each square/house shows:
- The zodiac sign, and (if enabled) the house number.
- **As** (or **La** in Tamil) marks the Ascendant/Lagna.
- Planets placed in that sign, abbreviated (e.g. "Su" for Sun — full
  Tamil names/abbreviations when Tamil is selected).
- Each planet's degree within the sign.
- A small **R** superscript marks a retrograde planet.
- A colored tag marks **Uccha** (exalted) or **Neecha** (debilitated)
  planets.

If a square is very crowded (several planets together), it becomes
scrollable rather than overflowing — scroll within the square to see
everything in it.

### Charam (Chara Karakas)

A table below the chart ranks each of the seven classical planets by
degree within its sign, from Atmakaraka (highest) to Darakaraka (lowest)
— the traditional Jaimini "significator" scheme.

### Vimshottari Dasha

A timeline of planetary periods (the traditional dasha system used for
timing predictions), shown three levels deep: **Dasha** (main period),
**Bhukti** (sub-period), and **Antharam** (sub-sub-period). Click the +
next to any row to expand it and see its sub-periods.

---

## Jamakol tab

Jamakol divides the day (sunrise to the next day's sunrise) into 8 equal
periods, shown as a ring of 8 boxes around a central Rasi (D1) chart for
the same birth details.

### Birth details

Same date/time/place inputs as the Horoscope tab (and, as noted above,
shared with it) — plus:
- A read-only **Day** field showing the weekday for whichever date is
  entered.
- A **Use current time** button, which fills in the current date/time/
  place and regenerates immediately.

### The ring and inner chart

The 8 ring boxes show which planet (or Maandi, a calculated point) rules
the current period of the day, and its associated sunrise-based degree.
The inner 4×4 area is the same Rasi (D1) chart as the Horoscope tab,
additionally marking three special squares when applicable:

- **Aarudom** (purple) — a square derived from the birth time, shown with
  its own degree.
- **Udayam** (teal) — a square derived from how far into the day the
  birth time falls, shown with its own degree.
- **Kavippu** (red) — a square derived from combining the Sun's position
  with Aarudom and Udayam, shown with its own degree.

### Rahukalam / Yamakandam / Gulikaal

A card showing three traditionally inauspicious time windows for the
selected day and place, each given as a start–end clock time.

### Computed values

Sunrise, sunset, and the next day's sunrise for the selected date and
place — the reference points the rest of the Jamakol chart is built from.

---

## Notes shown in the app

Some features carry a small note in the app itself (e.g. "unverified" or
"pending astrologer sign-off"). These mark features whose underlying rule
is still being reviewed for accuracy — the feature is fully usable, but
treat the specific numbers with appropriate caution until the note is
removed.
