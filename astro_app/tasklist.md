# Task list

## ✅ 1. Rahukalam, Yamakandam, Gulikaal — based on local sunrise/sunset

Three traditional "inauspicious period" windows, each a 1/8th slice of the
daytime (sunrise to sunset), with which slice depending on the weekday.

- [x] Implement the calculation — `web/src/astro/rahukalam.ts`
      (`computeRahuYamaGulika`)
- [x] Show as a card on the Jamakol tab, above "Computed values"
- [x] Verify by hand against two different weekdays (Saturday, Tuesday) —
      both exact matches against the app's own sunrise/sunset
- [x] Refactor: sunrise/sunset computation shared via
      `web/src/astro/sunTimes.ts`, `weekdayIndexForDate` shared via
      `web/src/astro/util.ts` (both now used by `jamakol.ts` and
      `rahukalam.ts`)
- [ ] 🔲 **Astrologer confirmation** — the standard Panchangam segment
      table was implemented directly (uniform across every reference
      checked, unlike the Jamakol ring), but is **not yet confirmed** for
      this app specifically. Flagged in-app (caveat line on the card) and
      in `PROJECT_BRIEF.md`.
- [ ] 🔲 Decide: nighttime Gulikaal variant needed, or daytime-only is enough?
- [ ] 🔲 Decide: should this also appear on the Horoscope page, or stay
      Jamakol-only (current)?


## ⬜ 2. Add male/female entry option

A gender field on the birth details form. Not started.

- [ ] 🔲 **Astrologer confirmation** — is gender purely a record-keeping/
      display field (no effect on any calculation in the app today), or
      does it actually feed some planned technique (certain dasha
      variants, Ashtakavarga readings, and a few other classical
      techniques differ by gender in some traditions)? Get the specific
      rule before wiring it into any calculation, not just the form.
- [ ] Decide scope: shared across both tabs like date/time/place
      (`BirthDetailsContext`), or Horoscope-only like `name` currently is
- [ ] Add the form field (`BirthForm.tsx`, and `JamakolPage.tsx`'s own
      form if it's meant to be global) — a select or radio group, not
      free text
- [ ] Confirm exact label wording, and whether a third option
      ("prefer not to say" / non-binary) is wanted
- [ ] Add English/Tamil translations in `i18n/translations.ts`
- [ ] If gender ends up feeding a calculation, document that rule in
      `PROJECT_BRIEF.md` the same way every other astrological rule here
      is documented — confirmed-vs-assumed, worked example, edge cases
