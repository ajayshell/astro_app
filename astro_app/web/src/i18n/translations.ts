export type Language = "en" | "ta";

type Dict = Record<string, { en: string; ta: string }>;

// UI strings. Tamil phrasing is a first pass -- worth the astrologer (or a
// Tamil-speaking reviewer) checking wording/register before this ships.
export const UI_TEXT: Dict = {
  birthDetails: { en: "Birth details", ta: "பிறப்பு விவரங்கள்" },
  name: { en: "Name", ta: "பெயர்" },
  dateOfBirth: { en: "Date of birth", ta: "பிறந்த தேதி" },
  timeOfBirth: { en: "Time of birth", ta: "பிறந்த நேரம்" },
  placeOfBirth: { en: "Place of birth", ta: "பிறந்த இடம்" },
  customCoordinates: { en: "Custom coordinates...", ta: "விருப்ப அட்ச/தீர்க்கரேகை..." },
  latitude: { en: "Latitude", ta: "அட்சரேகை" },
  longitude: { en: "Longitude", ta: "தீர்க்கரேகை" },
  generateChart: { en: "Generate chart", ta: "ஜாதகம் உருவாக்கு" },
  chartStyle: { en: "Chart style", ta: "ஜாதக வடிவம்" },
  southIndian: { en: "South Indian", ta: "தென்னிந்திய முறை" },
  northIndian: { en: "North Indian", ta: "வடஇந்திய முறை" },
  view: { en: "View", ta: "காட்சி" },
  overviewOption: { en: "Overview (D1 + D9 + Transit)", ta: "மேலோட்டம் (D1 + D9 + கோச்சாரம்)" },
  exploreOption: { en: "Explore a single divisional chart", ta: "ஒரு வர்க்க சக்கரத்தை ஆராயுங்கள்" },
  divisionalChart: { en: "Divisional chart", ta: "வர்க்க சக்கரம்" },
  pendingSignOff: { en: "Pending astrologer sign-off", ta: "ஜோதிடர் உறுதிப்படுத்த வேண்டியவை" },
  computedValues: { en: "Computed values", ta: "கணக்கிடப்பட்ட மதிப்புகள்" },
  ayanamsa: { en: "Ayanamsa (Lahiri, approx.)", ta: "அயனாம்சம் (லாஹிரி, தோராயம்)" },
  ascendant: { en: "Ascendant", ta: "லக்னம்" },
  graha: { en: "Graha", ta: "கிரகம்" },
  sign: { en: "Sign", ta: "ராசி" },
  degree: { en: "Degree", ta: "பாகை" },
  nakshatra: { en: "Nakshatra", ta: "நட்சத்திரம்" },
  pada: { en: "Pada", ta: "பாதம்" },
  dragHint: {
    en: "Drag a planet chip into another house to test alternate placements.",
    ta: "மற்றொரு வீட்டிற்கு கிரகத்தை இழுத்து மாற்று மதிப்பீடு செய்யவும்.",
  },
  dashaTitle: {
    en: "Vimshottari Dasha (Dasha / Bhukti / Antharam)",
    ta: "விம்சோத்தரி தசை (தசை / புக்தி / அந்தரம்)",
  },
  dashaLordHeader: { en: "Lord", ta: "அதிபதி" },
  dashaLevel: { en: "Dasha", ta: "தசை" },
  bhuktiLevel: { en: "Bhukti", ta: "புக்தி" },
  antharamLevel: { en: "Antharam", ta: "அந்தரம்" },
  start: { en: "Start", ta: "தொடக்கம்" },
  end: { en: "End", ta: "முடிவு" },
  enterBirthDetails: { en: "Enter birth details to generate a chart.", ta: "ஜாதகம் உருவாக்க பிறப்பு விவரங்களை உள்ளிடவும்." },
  rasiD1: { en: "Rasi (D1)", ta: "ராசி (D1)" },
  navamsaD9: { en: "Navamsa (D9)", ta: "நவாம்சம் (D9)" },
  transit: { en: "Transit (Gochara)", ta: "கோச்சாரம்" },
  language: { en: "Language", ta: "மொழி" },
  charamTitle: { en: "Charam — Chara Karakas", ta: "சரம் — சர காரகர்கள்" },
  karaka: { en: "Karaka", ta: "காரகம்" },
  degreeInSign: { en: "Degree in sign", ta: "ராசியில் பாகை" },
  charamNote: {
    en: "7-karaka scheme (Sun-Saturn, no Rahu/Ketu) -- confirm this matches the intended tradition.",
    ta: "7-காரக முறை (சூரியன்-சனி, ராகு/கேது இல்லை) -- இது சரியான முறையா என ஜோதிடரிடம் உறுதி செய்யவும்.",
  },
  subtitle: { en: "South Indian Horoscope — for astrologer review", ta: "தென்னிந்திய ஜாதகம் — ஜோதிடர் ஆய்விற்காக" },
  horoscopeTitleSuffix: { en: "’s Horoscope", ta: " ஜாதகம்" },
  latLonInvalid: { en: "Latitude/longitude must be valid numbers.", ta: "அட்ச/தீர்க்கரேகை சரியான எண்களாக இருக்க வேண்டும்." },
  latLonRange: {
    en: "Latitude must be -90..90 and longitude -180..180.",
    ta: "அட்சரேகை -90..90 மற்றும் தீர்க்கரேகை -180..180 க்குள் இருக்க வேண்டும்.",
  },
  tzError: { en: "Could not resolve time zone for this location.", ta: "இந்த இடத்திற்கான நேர மண்டலத்தை கண்டறிய முடியவில்லை." },
  uccha: { en: "Uccha", ta: "உச்சம்" },
  neecha: { en: "Neecha", ta: "நீசம்" },
  retro: { en: "Retro", ta: "வக்ரம்" },
  tabHoroscope: { en: "Horoscope", ta: "ஜாதகம்" },
  tabJamakol: { en: "Jamakol", ta: "ஜாமக்கோளம்" },
  jamakolTitle: { en: "Jamakol Chart", ta: "ஜாமக்கோள ஜாதகம்" },
  jamakolSubtitle: {
    en: "Jamakol (8-fold sunrise-to-sunrise division) — for astrologer review",
    ta: "ஜாமக்கோளம் (சூரிய உதயம் முதல் அடுத்த உதயம் வரை 8 பிரிவுகள்) — ஜோதிடர் ஆய்விற்காக",
  },
  jamakolWarning: {
    en: "Unverified: this uses a best-effort planetary-hours-style rule, not a confirmed Jamakol formula. Do not rely on this for real timing decisions until an astrologer checks it.",
    ta: "சரிபார்க்கப்படவில்லை: இது உறுதி செய்யப்படாத ஒரு தோராய முறையைப் பயன்படுத்துகிறது. ஜோதிடர் உறுதிப்படுத்தும் வரை இதை நம்பி முடிவெடுக்க வேண்டாம்.",
  },
  dateAndTime: { en: "Date and time", ta: "தேதி மற்றும் நேரம்" },
  generate: { en: "Generate", ta: "உருவாக்கு" },
  useNow: { en: "Use current time", ta: "தற்போதைய நேரத்தைப் பயன்படுத்து" },
  jamam: { en: "Jamam", ta: "ஜாமம்" },
  dayLabel: { en: "Day", ta: "பகல்" },
  nightLabel: { en: "Night", ta: "இரவு" },
  currentJamam: { en: "Current", ta: "தற்போதைய" },
  sunriseLabel: { en: "Sunrise", ta: "சூரிய உதயம்" },
  sunsetLabel: { en: "Sunset", ta: "சூரிய அஸ்தமனம்" },
  nextSunriseLabel: { en: "Next sunrise", ta: "அடுத்த சூரிய உதயம்" },
  weekdayLordLabel: { en: "Weekday lord", ta: "வார அதிபதி" },
  showHouseNumbers: { en: "Show house numbers", ta: "வீட்டு எண்களைக் காட்டு" },
  maandi: { en: "Maandi", ta: "மாந்தி" },
};

export const ASCENDANT_MARKER: { en: string; ta: string } = { en: "As", ta: "La" };

// Index-aligned with RASI_NAMES in astro/constants.ts (0 = Aries .. 11 = Pisces).
export const RASI_NAMES_TA = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
  "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்",
];

// Short forms for cramped chart-grid cells.
export const RASI_ABBR_TA = [
  "மேஷ", "ரிஷ", "மிது", "கட", "சிம்", "கன்னி",
  "துலா", "விருச்", "தனு", "மகர", "கும்ப", "மீன",
];

// Index-aligned with NAKSHATRA_NAMES in astro/constants.ts.
export const NAKSHATRA_NAMES_TA = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி",
];

// Index-aligned with PLANET_ORDER in astro/constants.ts.
export const PLANET_NAMES_TA: Record<string, string> = {
  Sun: "சூரியன்",
  Moon: "சந்திரன்",
  Mars: "செவ்வாய்",
  Mercury: "புதன்",
  Jupiter: "குரு",
  Venus: "சுக்கிரன்",
  Saturn: "சனி",
  Rahu: "ராகு",
  Ketu: "கேது",
};

// Index-aligned with CHARA_KARAKA_NAMES in astro/charaKaraka.ts.
export const CHARA_KARAKA_NAMES_TA = [
  "ஆத்மகாரகன்", "அமைச்சகாரகன்", "சகோதரகாரகன்", "மாதுர்காரகன்",
  "புத்திரகாரகன்", "ஞாதிகாரகன்", "தாரகாரகன்",
];
