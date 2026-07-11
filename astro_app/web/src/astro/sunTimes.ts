import * as Astronomy from "astronomy-engine";
import tzlookup from "tz-lookup";

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  zoneName: string; // IANA zone for the location -- display all times in this zone, not the viewer's local one
}

/** Sunrise/sunset/next-sunrise for the given location, bracketing referenceInstant. Shared by jamakol.ts and rahukalam.ts, both of which divide the daytime span into equal segments. */
export function computeSunTimes(referenceInstant: Date, latitude: number, longitude: number): SunTimes {
  const observer = new Astronomy.Observer(latitude, longitude, 0);

  const sunriseTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, referenceInstant, -2);
  if (!sunriseTime) throw new Error("Could not find sunrise for this location/date (polar location?).");
  const sunsetTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, sunriseTime, 2);
  if (!sunsetTime) throw new Error("Could not find sunset for this location/date (polar location?).");
  const nextSunriseTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, sunsetTime, 2);
  if (!nextSunriseTime) throw new Error("Could not find next sunrise for this location/date (polar location?).");

  return {
    sunrise: sunriseTime.date,
    sunset: sunsetTime.date,
    nextSunrise: nextSunriseTime.date,
    zoneName: tzlookup(latitude, longitude),
  };
}
