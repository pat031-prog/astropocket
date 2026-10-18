import { test } from "node:test";
import assert from "node:assert/strict";
import {
  angularDistance,
  calculateAspects,
  calculateTransits,
  natalLongitude,
  searchTransits,
  validDate,
} from "../services/astronomyService";
import { formatDegree, signIndex } from "../services/astroDisplay";

test("el zodíaco cruza 0° sin producir falsas oposiciones", () => {
  assert.equal(angularDistance(359, 1), 2);
  assert.equal(angularDistance(1, 359), 2);
  const contacts = calculateAspects(
    [
      {
        name: "Sun",
        longitude: 359,
        sign: "Pisces",
        signDegree: 29,
        isRetrograde: false,
        speed: 1,
      },
    ],
    { Sol: { sign: "Aries", deg: 1 } },
  );
  assert.equal(contacts.length, 1);
  assert.equal(contacts[0].type, "Conjunction");
  assert.equal(contacts[0].orb, 2);
  assert.equal(contacts[0].applying, true);
});
test("signos españoles, ingleses y grados al límite", () => {
  assert.equal(signIndex("Géminis"), 2);
  assert.equal(signIndex("Gemini"), 2);
  assert.equal(natalLongitude("Acuario", 10), 310);
  assert.equal(formatDegree(29.99999), "29° 59′");
  assert.throws(() => natalLongitude("Inventado", 1));
  assert.throws(() => natalLongitude("Aries", 30));
});
test("equinoccio de marzo de 2026 contra USNO: Sol cerca de 0° Aries", () => {
  // USNO Earth Seasons 2026: 20 de marzo, 14:46 UT. Tolerancia de 1.2 minutos de arco.
  const sun = calculateTransits(new Date("2026-03-20T14:46:00Z")).find(
    (planet) => planet.name === "Sun",
  )!;
  assert.ok(angularDistance(sun.longitude, 0) < 0.02, `Sol=${sun.longitude}`);
  assert.equal(sun.isRetrograde, false);
});
test("el buscador encuentra el ingreso de Aries y no confunde el cruce opuesto", async () => {
  const result = await searchTransits(
    { Sol: { sign: "Aries", deg: 0 } },
    "2026-03-19T00:00:00Z",
    "2026-03-22T00:00:00Z",
    ["Sun"],
  );
  assert.equal(result.events.length, 1);
  const event = result.events[0];
  assert.equal(event.type, "Conjunction");
  assert.ok(
    Math.abs(Date.parse(event.date) - Date.parse("2026-03-20T14:46:00Z")) <
      30 * 60000,
  );
  assert.ok(event.orb < 0.0001);
});
test("conserva los tres pasos de Mercurio, incluyendo el retrógrado", async () => {
  const result = await searchTransits(
    { Punto: { sign: "Piscis", deg: 15 } },
    "2026-02-01T00:00:00Z",
    "2026-05-01T00:00:00Z",
    ["Mercury"],
  );
  const conjunctions = result.events.filter(
    (event) => event.type === "Conjunction",
  );
  assert.equal(conjunctions.length, 3);
  assert.deepEqual(
    conjunctions.map((event) => event.retrograde),
    [false, true, false],
  );
  assert.ok(
    result.events.every(
      (event, index) =>
        index === 0 ||
        Date.parse(event.date) > Date.parse(result.events[index - 1].date),
    ),
  );
});
test("valida rango, Luna, cuerpos admitidos y cancelación", async () => {
  const natal = { Sol: { sign: "Aries", deg: 0 } };
  assert.throws(() => validDate("no es fecha"));
  assert.throws(() => validDate("2200-01-01"));
  await assert.rejects(
    searchTransits(natal, "2027-01-01", "2028-02-01", ["Sun"]),
    /intervalo/,
  );
  await assert.rejects(
    searchTransits(natal, "2027-01-01", "2027-03-01", ["Moon"]),
    /Luna/,
  );
  await assert.rejects(
    searchTransits(natal, "2027-01-01", "2027-02-01", ["Lilith"]),
    /planetas/,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    searchTransits(
      natal,
      "2027-01-01",
      "2027-02-01",
      ["Sun"],
      controller.signal,
    ),
    { name: "AbortError" },
  );
});
