import { createSwissEph, Body, type SwissEph } from "@kuntay/swisseph";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import {
  BODIES,
  calculateAspects,
  searchContacts as findCrossings,
  validDate,
} from "../services/astroMath.js";
import { SIGNS } from "../services/astroDisplay.js";
import type { NatalChart, TransitPlanet } from "../types";

export const ENGINE = {
  name: "Swiss Ephemeris",
  version: "2.10.03",
  zodiac: "tropical",
  frame: "geocéntrico aparente · equinoccio de fecha",
  range: "1900–2100",
  dataset: "DE441 · archivos locales .se1",
  reference:
    "https://horoscopes.astro-seek.com/jpl-de431-ephemeris-astrology-online-tables",
};
const require = createRequire(import.meta.url);
// All requests use the same immutable tropical/geocentric settings. No caller can set sidereal or topocentric state.
let failure = "";
const loaded: Promise<SwissEph | null> = (async () => {
  const manifest = JSON.parse(
    await readFile(
      require.resolve("@kuntay/swisseph-data/manifest.json"),
      "utf8",
    ),
  );
  const files: Record<string, Uint8Array> = {};
  for (const file of ["sepl_18.se1", "semo_18.se1", "seas_18.se1"]) {
    const bytes = await readFile(
      require.resolve("@kuntay/swisseph-data/" + file),
    );
    const expected = manifest.files.find(
      (entry: { file: string }) => entry.file === file,
    );
    if (
      !expected ||
      createHash("sha256").update(bytes).digest("hex") !== expected.sha256
    )
      throw new Error("Archivo de efemérides inválido.");
    files[file] = bytes;
  }
  const swe = await createSwissEph({ files });
  if (swe.calc(swe.julianDay(2026, 1, 1, 12), Body.Sun).ephemeris !== "swiss")
    throw new Error("No se cargaron las efemérides completas.");
  return swe;
})().catch((error) => {
  failure =
    error instanceof Error ? error.message : "No se pudo cargar el motor.";
  return null;
});
export async function getEphemeris() {
  const swe = await loaded;
  if (!swe) throw new Error("Efemérides locales no disponibles. " + failure);
  return swe;
}
const julianDay = (date: Date) => date.getTime() / 86400000 + 2440587.5;
function position(swe: SwissEph, name: string, date: Date) {
  if (!BODIES.includes(name as (typeof BODIES)[number]))
    throw new Error("Planeta no soportado.");
  const value = swe.calc(julianDay(date), Body[name as keyof typeof Body]);
  if (value.ephemeris !== "swiss" || value.warning)
    throw new Error(
      "La posición no pudo calcularse con las efemérides locales completas.",
    );
  return value;
}
export async function snapshot(date: string, natal: NatalChart) {
  const swe = await getEphemeris();
  const instant = validDate(date);
  const transits: TransitPlanet[] = BODIES.map((name) => {
    const value = position(swe, name, instant);
    return {
      name,
      longitude: value.longitude,
      sign: SIGNS[Math.floor(value.longitude / 30)],
      signDegree: value.longitude % 30,
      isRetrograde: value.longitudeSpeed < 0,
      speed: value.longitudeSpeed,
    };
  });
  return {
    date: instant.toISOString(),
    engine: ENGINE,
    transits,
    aspects: calculateAspects(transits, natal),
    limitations: [
      "Carta natal con posiciones aportadas por el usuario; la carta heredada requiere verificar sus datos.",
      "Las casas natales sólo se interpretan cuando se hayan calculado con nacimiento y ubicación.",
    ],
  };
}
export async function searchTransits(
  natal: NatalChart,
  from: string,
  to: string,
  planets?: string[],
  signal?: AbortSignal,
) {
  const swe = await getEphemeris();
  return findCrossings(
    natal,
    from,
    to,
    planets,
    signal,
    (name, date) => position(swe, name, date).longitude,
  );
}
export async function housesAt(
  date: string,
  latitude: number,
  longitude: number,
  system: "P" | "W" | "E",
) {
  const swe = await getEphemeris();
  return swe.houses(julianDay(validDate(date)), latitude, longitude, system);
}
