import type {Aspect,NatalChart,TransitEvent,TransitPlanet,TransitSearch} from "../types.js";
import {signIndex} from "./astroDisplay.js";

export const BODIES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
export const ASPECTS: {
  type: Aspect["type"];
  angle: number;
  orb: number;
  nature: Aspect["nature"];
}[] = [
  { type: "Conjunction", angle: 0, orb: 8, nature: "Neutral" },
  { type: "Sextile", angle: 60, orb: 4, nature: "Soft" },
  { type: "Square", angle: 90, orb: 7, nature: "Hard" },
  { type: "Trine", angle: 120, orb: 7, nature: "Soft" },
  { type: "Opposition", angle: 180, orb: 8, nature: "Hard" },
];
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
export const signedAngle = (angle: number) => normalizeAngle(angle + 180) - 180;
export const angularDistance = (a: number, b: number) =>
  Math.abs(signedAngle(a - b));
export function validDate(value: Date | string) {
  const date = new Date(value);
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 2100
  )
    throw new Error("Elegí una fecha entre 1900 y 2100.");
  return date;
}
export function natalLongitude(sign: string, degree: number) {
  const index = signIndex(sign);
  if (index < 0 || !Number.isFinite(degree) || degree < 0 || degree >= 30)
    throw new Error("Posición natal inválida.");
  return index * 30 + degree;
}
export function calculateAspects(
  transits: TransitPlanet[],
  natal: NatalChart,
): Aspect[] {
  const result: Aspect[] = [];
  for (const transit of transits)
    for (const [name, position] of Object.entries(natal)) {
      const longitude = natalLongitude(position.sign, position.deg);
      const distance = angularDistance(transit.longitude, longitude);
      for (const definition of ASPECTS) {
        const orb = Math.abs(distance - definition.angle);
        if (orb <= definition.orb) {
          const nextOrb = Math.abs(
            angularDistance(
              transit.longitude + (transit.speed ?? 0) / 100,
              longitude,
            ) - definition.angle,
          );
          result.push({
            transitingPlanet: transit.name,
            natalPlanet: name,
            type: definition.type,
            orb: Number(orb.toFixed(4)),
            nature: definition.nature,
            angleDiff: distance,
            applying: nextOrb < orb,
          });
          break;
        }
      }
    }
  return result.sort((a, b) => a.orb - b.orb);
}
export async function searchContacts(
  natal: NatalChart,
  from: string,
  to: string,
  planets: string[] = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"],
  signal: AbortSignal | undefined,
  longitudeAt: (name: string, date: Date) => number,
): Promise<TransitSearch> {
  const first = validDate(from).getTime();
  const last = validDate(to).getTime();
  if (last <= first || last - first > 366 * 86400000)
    throw new Error("El intervalo debe ser de 1 a 366 días.");
  if (
    !planets.length ||
    planets.length > 10 ||
    planets.some((name) => !BODIES.includes(name as (typeof BODIES)[number]))
  )
    throw new Error("Selección de planetas inválida.");
  if (planets.includes("Moon") && last - first > 31 * 86400000)
    throw new Error("Buscá la Luna en intervalos de hasta 31 días.");
  const natalPoints = Object.entries(natal).map(([name, p]) => ({
    name,
    longitude: natalLongitude(p.sign, p.deg),
  }));
  const events: TransitEvent[] = [];
  const step = 6 * 3600000;
  for (const planet of planets) {
    const samples: { time: number; longitude: number }[] = [];
    for (let time = first; time <= last + step; time += step) {
      if (signal?.aborted) throw new DOMException("Cancelado", "AbortError");
      const instant = Math.min(last, time);
      samples.push({
        time: instant,
        longitude: longitudeAt(planet, new Date(instant)),
      });
      if (instant === last) break;
      if (samples.length % 120 === 0)
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
    for (const natalPoint of natalPoints)
      for (const definition of ASPECTS) {
        const targets =
          definition.angle === 0 || definition.angle === 180
            ? [definition.angle]
            : [definition.angle, -definition.angle];
        for (const target of targets)
          for (let i = 1; i < samples.length; i++) {
            const error = (longitude: number) =>
              signedAngle(longitude - natalPoint.longitude - target);
            let a = samples[i - 1].time;
            let b = samples[i].time;
            let ea = error(samples[i - 1].longitude);
            const eb = error(samples[i].longitude);
            if (ea * eb > 0 || Math.abs(ea - eb) > 180) continue;
            for (
              let refinement = 0;
              refinement < 24 && b - a > 1000;
              refinement++
            ) {
              const mid = (a + b) / 2;
              const em = error(longitudeAt(planet, new Date(mid)));
              if (ea * em <= 0) b = mid;
              else {
                a = mid;
                ea = em;
              }
            }
            const time = Math.round((a + b) / 2);
            if (
              events.some(
                (event) =>
                  event.transitingPlanet === planet &&
                  event.natalPlanet === natalPoint.name &&
                  event.type === definition.type &&
                  Math.abs(Date.parse(event.date) - time) < 3600000,
              )
            )
              continue;
            const longitude = longitudeAt(planet, new Date(time));
            const velocity = signedAngle(
              longitudeAt(planet, new Date(time + 3600000)) -
                longitudeAt(planet, new Date(time - 3600000)),
            );
            events.push({
              id: `${planet}-${natalPoint.name}-${definition.type}-${time}`,
              date: new Date(time).toISOString(),
              transitingPlanet: planet,
              natalPlanet: natalPoint.name,
              type: definition.type,
              longitude,
              retrograde: velocity < 0,
              orb: Math.abs(error(longitude)),
            });
          }
      }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  events.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  return {
    from: new Date(first).toISOString(),
    to: new Date(last).toISOString(),
    planets: [...new Set(planets)],
    events: events.slice(0, 100),
    total: events.length,
    truncated: events.length > 100,
  };
}
