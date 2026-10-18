import { Temporal } from "@js-temporal/polyfill";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { houseOf, Body } from "@kuntay/swisseph";
import { getEphemeris, housesAt, snapshot, ENGINE } from "./ephemeris.js";
import { validDate } from "../services/astroMath.js";
import { SIGNS } from "../services/astroDisplay.js";
import type { BirthPlace, NatalChart, NatalProfile } from "../types";

export const birthSchema = z.object({
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timeKnown: z.boolean(),
  place: z.object({
    id: z.string().max(40),
    name: z.string().min(1).max(150),
    country: z.string().max(3),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    zone: z.string().min(1).max(80),
  }),
  timeZone: z.string().min(1).max(80),
  houseSystem: z.enum(["P", "W", "E"]),
});
let cities:
  | Promise<(BirthPlace & { population: number; search: string })[]>
  | undefined;
export async function findPlaces(query: string): Promise<BirthPlace[]> {
  if (query.trim().length < 2) return [];
  cities ||= readFile(
    path.join(process.cwd(), "data/geonames/cities.json"),
    "utf8",
  ).then(JSON.parse);
  const term = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return (await cities)
    .filter((city) => city.search.includes(term))
    .sort(
      (a, b) =>
        Number(b.search.startsWith(term)) - Number(a.search.startsWith(term)) ||
        b.population - a.population,
    )
    .slice(0, 10)
    .map(({ population, search, ...place }) => place);
}
export async function calculateNatal(
  input: z.infer<typeof birthSchema>,
): Promise<{ natal: NatalChart; profile: NatalProfile }> {
  let instant: string;
  try {
    instant = Temporal.PlainDateTime.from(
      `${input.date}T${input.timeKnown ? input.time : "12:00"}:00`,
      { overflow: "reject" },
    )
      .toZonedDateTime(input.timeZone, { disambiguation: "reject" })
      .toInstant()
      .toString();
  } catch {
    throw new Error(
      "La fecha, hora o zona no es válida, o coincide con un cambio horario. Revisá la zona; podés indicar un desfase explícito como -03:00 en Ajustes.",
    );
  }
  const date = validDate(instant);
  const swe = await getEphemeris();
  const sky = await snapshot(instant, {});
  const houses = input.timeKnown
    ? await housesAt(
        instant,
        input.place.latitude,
        input.place.longitude,
        input.houseSystem,
      )
    : null;
  const aliases: Record<string, string> = {
    Sun: "Sol",
    Moon: "Luna",
    Mercury: "Mercurio",
    Mars: "Marte",
    Saturn: "Saturno",
    Uranus: "Urano",
    Neptune: "Neptuno",
    Pluto: "Pluton",
  };
  const natal: NatalChart = {};
  const add = (
    name: string,
    longitude: number,
    retrograde = false,
    withHouse = true,
  ) => {
    natal[name] = {
      sign: SIGNS[Math.floor(longitude / 30)],
      deg: longitude % 30,
      ...(retrograde ? { retrograde } : {}),
      ...(houses && withHouse
        ? { house: houseOf(longitude, houses.cusps) }
        : {}),
    };
  };
  sky.transits.forEach((planet) =>
    add(
      aliases[planet.name] || planet.name,
      planet.longitude,
      planet.isRetrograde,
    ),
  );
  const node = swe.calc(date.getTime() / 86400000 + 2440587.5, Body.TrueNode);
  add("NodoN", node.longitude, node.longitudeSpeed < 0);
  if (houses) {
    add("Asc", houses.ascendant, false, false);
    add("MC", houses.midheaven, false, false);
  }
  return {
    natal,
    profile: {
      birth: input,
      instant,
      cusps: houses?.cusps || null,
      ...(houses
        ? { ascendant: houses.ascendant, midheaven: houses.midheaven }
        : {}),
      warning: !input.timeKnown
        ? "Hora desconocida: posiciones a las 12:00 locales, sin Ascendente ni casas. La Luna puede variar durante el día."
        : houses?.substituted
          ? "Este sistema no está definido a esa latitud: se usó Porfirio."
          : undefined,
      engine: ENGINE.name + " " + ENGINE.version,
    },
  };
}
