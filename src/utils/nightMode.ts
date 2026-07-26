export type NightModeSetting = "auto" | "always_night" | "always_day";

export interface SunTimesInfo {
  sunriseStr: string; // e.g. "06:15"
  sunsetStr: string;  // e.g. "17:52"
  isNightNow: boolean;
  reason: string;
}

/**
 * Calculates approximate astronomical sunrise and sunset times for a given lat/lng and date.
 * Defaults to Belo Horizonte coordinates (-19.9221, -43.9382) if not specified.
 */
export function calculateSunTimes(
  lat: number = -19.9221,
  lng: number = -43.9382,
  date: Date = new Date()
): SunTimesInfo {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentTotalMin = hours * 60 + minutes;

  // Day of year calculation
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Declination angle of the Sun in radians
  const declination =
    23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180) * (Math.PI / 180);

  const latRad = (lat * Math.PI) / 180;

  // Hour angle omega in degrees
  let cosOmega = -Math.tan(latRad) * Math.tan(declination);
  cosOmega = Math.max(-1, Math.min(1, cosOmega)); // Clamp values to valid domain
  const omegaDeg = (Math.acos(cosOmega) * 180) / Math.PI;

  // Solar noon estimation in local time
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const solarNoonUTC = 12 - lng / 15;
  let solarNoonLocal = solarNoonUTC + timezoneOffsetHours;
  if (solarNoonLocal < 0) solarNoonLocal += 24;
  if (solarNoonLocal >= 24) solarNoonLocal -= 24;

  const halfDayHours = omegaDeg / 15;

  let sunriseHourLocal = solarNoonLocal - halfDayHours;
  let sunsetHourLocal = solarNoonLocal + halfDayHours;

  if (sunriseHourLocal < 0) sunriseHourLocal += 24;
  if (sunsetHourLocal >= 24) sunsetHourLocal -= 24;

  const sunriseMin = Math.round(sunriseHourLocal * 60);
  const sunsetMin = Math.round(sunsetHourLocal * 60);

  const formatMinToStr = (totMin: number) => {
    const h = Math.floor((totMin / 60) % 24);
    const m = Math.floor((totMin % 60) % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const sunriseStr = formatMinToStr(sunriseMin);
  const sunsetStr = formatMinToStr(sunsetMin);

  // Night is when current time is earlier than sunrise or later/equal to sunset
  const isNightNow = currentTotalMin < sunriseMin || currentTotalMin >= sunsetMin;

  const timeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const reason = isNightNow
    ? `Horário (${timeFormatted}) entre o pôr do sol (${sunsetStr}) e nascer (${sunriseStr})`
    : `Horário (${timeFormatted}) diurno (Nascer ${sunriseStr} • Pôr do sol ${sunsetStr})`;

  return {
    sunriseStr,
    sunsetStr,
    isNightNow,
    reason,
  };
}

export function getEffectiveMapStyle(
  setting: NightModeSetting,
  userSelectedStyle: string,
  lat?: number,
  lng?: number
): { effectiveStyle: string; isNightActive: boolean; sunInfo: SunTimesInfo } {
  const sunInfo = calculateSunTimes(lat, lng);

  if (setting === "always_night") {
    return { effectiveStyle: "dark_neon", isNightActive: true, sunInfo };
  }
  if (setting === "always_day") {
    const style = userSelectedStyle === "dark_neon" ? "cyclosm" : userSelectedStyle;
    return { effectiveStyle: style, isNightActive: false, sunInfo };
  }

  // AUTO mode (default)
  if (sunInfo.isNightNow) {
    return { effectiveStyle: "dark_neon", isNightActive: true, sunInfo };
  } else {
    return { effectiveStyle: userSelectedStyle, isNightActive: false, sunInfo };
  }
}
