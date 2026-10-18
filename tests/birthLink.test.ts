import { test } from "node:test";
import assert from "node:assert/strict";
import { makeBirthLink, readBirthLink } from "../services/birthLink";

const birth = {
  date: "2000-01-01", time: "12:00", timeKnown: true,
  place: { id: "example", name: "Córdoba", country: "AR", latitude: -31.4, longitude: -64.2, zone: "America/Argentina/Cordoba" },
  timeZone: "America/Argentina/Cordoba", houseSystem: "P" as const,
};
test("el enlace privado conserva nacimiento y tildes sin enviarlos como query", () => {
  const url = new URL(makeBirthLink("https://example.com/?old=1#pilot-input", birth));
  assert.equal(url.search, "");
  assert.deepEqual(readBirthLink(url.hash), birth);
  assert.equal(readBirthLink("#pilot-input"), null);
});
test("excluye credenciales, historial y campos extra al crear y al abrir", () => {
  const extra = { ...birth, apiKey: "test-credential", messages: ["private"], place: { ...birth.place, token: "secret" } };
  const link = makeBirthLink("https://example.com", extra);
  assert.deepEqual(readBirthLink(new URL(link).hash), birth);
  const injected = "#carta=" + btoa(JSON.stringify({ v: 1, birth: { ...extra, place: { ...extra.place, name: "City" } }, key: "secret" }));
  assert.deepEqual(readBirthLink(injected), { ...birth, place: { ...birth.place, name: "City" } });
});
test("rechaza datos inválidos o enormes en vez de reemplazar la carta", () => {
  for (const bad of ["#carta=broken", "#carta=" + "x".repeat(4100), "#carta=" + btoa(JSON.stringify({ v: 2, birth }))])
    assert.throws(() => readBirthLink(bad));
  assert.throws(() => makeBirthLink("https://example.com", { ...birth, time: "25:80" }));
  assert.throws(() => makeBirthLink("https://example.com", { ...birth, place: { ...birth.place, latitude: 100 } }));
});
