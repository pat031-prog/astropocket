import * as Astronomy from "astronomy-engine";
import type {NatalChart,TransitPlanet,TransitSearch} from "../types.js";
import {ZODIAC_SIGNS} from "../constants.js";
import{BODIES,normalizeAngle,signedAngle,validDate,calculateAspects,searchContacts}from"./astroMath.js";
export * from "./astroMath.js";

export const ENGINE = {
  name: "Astronomy Engine",
  version: "2.1.19",
  zodiac: "tropical",
  frame: "geocéntrico · equinoccio de fecha",
  range: "1900–2100",
};
export function planetLongitude(name: string, date: Date) {
  if (!BODIES.includes(name as (typeof BODIES)[number]))
    throw new Error("Cuerpo celeste no soportado.");
  return normalizeAngle(
    Astronomy.Ecliptic(Astronomy.GeoVector(name as Astronomy.Body, date, true))
      .elon,
  );
}
export function calculateTransits(value: Date): TransitPlanet[] {
  const date = validDate(value);
  const before = new Date(date.getTime() - 30 * 60000);
  const after = new Date(date.getTime() + 30 * 60000);
  return BODIES.map((name) => {
    const longitude = planetLongitude(name, date);
    const speed =
      signedAngle(
        planetLongitude(name, after) - planetLongitude(name, before),
      ) * 24;
    return {
      name,
      longitude,
      sign: ZODIAC_SIGNS[Math.floor(longitude / 30)],
      signDegree: longitude % 30,
      isRetrograde: speed < 0,
      speed,
    };
  });
}
export function snapshot(date: string, natal: NatalChart) {
  const instant = validDate(date);
  const transits = calculateTransits(instant);
  return {
    date: instant.toISOString(),
    engine: ENGINE,
    transits,
    aspects: calculateAspects(transits, natal),
    limitations: [
      "Carta natal con posiciones provistas por el usuario.",
      "Nodo lunar, casas, Quirón y Lilith en tránsito no incluidos.",
    ],
  };
}

export function searchTransits(natal:NatalChart,from:string,to:string,planets:string[]=["Jupiter","Saturn","Uranus","Neptune","Pluto"],signal?:AbortSignal,longitudeAt=planetLongitude):Promise<TransitSearch>{return searchContacts(natal,from,to,planets,signal,longitudeAt);}
