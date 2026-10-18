import { Aspect, TraditionMode } from "../types";

export const SIGNS = [
  "Aries",
  "Tauro",
  "Géminis",
  "Cáncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis",
];
const signKeys = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function signIndex(sign: string) {
  const key = normalize(sign);
  const index = signKeys.indexOf(key);
  return index >= 0
    ? index
    : SIGNS.findIndex((value) => normalize(value) === key);
}
export const signName = (sign: string) => SIGNS[signIndex(sign)] ?? sign;
const PLANETS: Record<string, string> = {
  Sun: "Sol",
  Moon: "Luna",
  Mercury: "Mercurio",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Uranus: "Urano",
  Neptune: "Neptuno",
  Pluto: "Plutón",
  Asc: "Ascendente", MC: "Medio Cielo",
  NodoN: "Nodo norte",
};
export const planetName = (name: string) => PLANETS[name] ?? name;
export const aspectName = (type: Aspect["type"]) =>
  ({
    Conjunction: "Conjunción",
    Opposition: "Oposición",
    Square: "Cuadratura",
    Trine: "Trígono",
    Sextile: "Sextil",
  })[type];
export const aspectGlyph = (type: Aspect["type"]) =>
  ({
    Conjunction: "☌",
    Opposition: "☍",
    Square: "□",
    Trine: "△",
    Sextile: "⚹",
  })[type];
export function formatDegree(degree: number) {
  const totalMinutes = Math.floor(degree * 60);
  return `${Math.floor(totalMinutes / 60)}° ${String(totalMinutes % 60).padStart(2, "0")}′`;
}
export const MODES: { id: TraditionMode; name: string; description: string }[] =
  [
    {
      id: "MODERN",
      name: "Psicológica",
      description: "Arquetipos, procesos internos y posibilidades.",
    },
    {
      id: "HELLENISTIC",
      name: "Helenística",
      description: "Una lectura desde la tradición clásica.",
    },
    {
      id: "VEDIC",
      name: "Védica",
      description: "Una perspectiva interpretativa desde Jyotish.",
    },
    {
      id: "DRACONIC",
      name: "Dracónica",
      description: "Una mirada simbólica al propósito.",
    },
    {
      id: "ORACLE",
      name: "Oracular",
      description: "Una lectura intuitiva y poética.",
    },
    {
      id: "ARCHETYPE",
      name: "Mitológica",
      description: "Planetas como personajes de tu historia.",
    },
    {
      id: "KOYOMI",
      name: "Koyomi",
      description: "Ciclos, naturaleza e impermanencia.",
    },
  ];
