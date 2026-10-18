import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { snapshot, searchTransits } from "../server/ephemeris";
import { angularDistance } from "../services/astronomyService";

test("60 posiciones contrastadas con las tablas DE431 publicadas por Astro-Seek", async (context) => {
  const reference = JSON.parse(
    await readFile(
      new URL("./astro-seek-reference.json", import.meta.url),
      "utf8",
    ),
  );
  let maximum = 0;
  let count = 0;
  for (const row of reference.rows) {
    const sky = await snapshot(row.date, { Sol: { sign: "Aries", deg: 0 } });
    assert.equal(sky.engine.name, "Swiss Ephemeris");
    for (const name of ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]) {
      const error = angularDistance(
        sky.transits.find((planet) => planet.name === name)!.longitude,
        row[name],
      );
      maximum = Math.max(maximum, error);
      count++;
      assert.ok(error <= 0.0002, `${row.date} ${name}: diferencia ${error}°`);
    }
  }
  assert.equal(count, 60);
  context.diagnostic(
    `Diferencia máxima respecto de las cifras publicadas: ${(maximum * 3600).toFixed(4)} segundos de arco.`,
  );
});
test("el buscador usa Swiss Ephemeris para preservar los tres pasos de Mercurio", async () => {
  const result = await searchTransits(
    { Punto: { sign: "Piscis", deg: 15 } },
    "2026-02-01T00:00:00Z",
    "2026-05-01T00:00:00Z",
    ["Mercury"],
  );
  const events = result.events.filter((event) => event.type === "Conjunction");
  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => event.retrograde),
    [false, true, false],
  );
});
test("consultas intercaladas a distintas fechas no alteran las posiciones", async () => {
  const natal = { Sol: { sign: "Aries", deg: 0 } };
  const [before, other, after] = await Promise.all([
    snapshot("2027-01-15T18:00:00Z", natal),
    snapshot("1987-06-11T03:00:00Z", natal),
    snapshot("2027-01-15T18:00:00Z", natal),
  ]);
  assert.deepEqual(before.transits, after.transits);
  assert.notDeepEqual(before.transits, other.transits);
});
