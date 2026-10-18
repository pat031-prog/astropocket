import type { NatalProfile } from "../types";

// Explicit fields strip unrelated data, including credentials and conversations.
function cleanBirth(value: unknown): NatalProfile["birth"] {
  const object = (item: unknown): Record<string, unknown> => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Datos inválidos.");
    return item as Record<string, unknown>;
  };
  const string = (item: unknown, max: number, min = 0): string => {
    if (typeof item !== "string" || item.length < min || item.length > max) throw new Error("Texto inválido.");
    return item;
  };
  const coordinate = (item: unknown, limit: number): number => {
    if (typeof item !== "number" || !Number.isFinite(item) || Math.abs(item) > limit) throw new Error("Coordenada inválida.");
    return item;
  };
  const input = object(value), place = object(input.place);
  const date = string(input.date, 10, 10), time = string(input.time, 5, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "1900-01-01" || date > "2100-12-31" ||
    new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || typeof input.timeKnown !== "boolean" ||
    !["P", "W", "E"].includes(String(input.houseSystem))) throw new Error("Nacimiento inválido.");
  return {
    date, time, timeKnown: input.timeKnown, houseSystem: input.houseSystem as "P" | "W" | "E",
    timeZone: string(input.timeZone, 80, 1),
    ...(input.nodeType === "mean" || input.nodeType === "true" ? { nodeType: input.nodeType } : {}),
    place: { id: string(place.id, 40), name: string(place.name, 150, 1), country: string(place.country, 3),
      latitude: coordinate(place.latitude, 90), longitude: coordinate(place.longitude, 180), zone: string(place.zone, 80, 1) },
  };
}
export function makeBirthLink(base: string, birth: NatalProfile["birth"]): string {
  const clean = { v: 1, birth: cleanBirth(birth) };
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  const encoded = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const url = new URL(base);
  url.search = "";
  // The fragment isn't sent in HTTP requests or Referer headers.
  url.hash = "carta=" + encoded;
  return url.toString();
}
export function readBirthLink(hash: string): NatalProfile["birth"] | null {
  if (!hash.startsWith("#carta=")) return null;
  if (hash.length > 4096) throw new Error("El enlace de la carta es demasiado largo.");
  try {
    const encoded = hash.slice(7).replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (payload?.v !== 1) throw new Error("Versión inválida.");
    return cleanBirth(payload.birth);
  } catch {
    throw new Error("Ese enlace de carta no es válido. Podés ingresar tu nacimiento de nuevo.");
  }
}
