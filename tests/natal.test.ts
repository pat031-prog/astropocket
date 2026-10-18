import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateNatal, findPlaces } from "../server/natal";

const place = {
  id: "3435910",
  name: "Buenos Aires",
  country: "AR",
  latitude: -34.61315,
  longitude: -58.37723,
  zone: "America/Argentina/Buenos_Aires",
};
const birth = {
  date: "2000-01-01",
  time: "12:00",
  timeKnown: true,
  place,
  timeZone: place.zone,
  houseSystem: "P" as const,
};
test("el nacimiento convierte la hora local y calcula doce casas sin deducir el Ascendente del Sol", async () => {
  const result = await calculateNatal(birth);
  assert.equal(result.profile.instant, "2000-01-01T15:00:00Z");
  assert.equal(result.profile.cusps?.length, 12);
  assert.equal(result.natal.Sol.sign, "Capricornio");
  assert.ok(result.natal.Asc);
  assert.ok(result.natal.MC);
  assert.ok(result.profile.cusps!.every((value) => value >= 0 && value < 360));
});
test("usa los cambios históricos de Argentina, en lugar de forzar UTC−03", async () => {
  const result = await calculateNatal({ ...birth, date: "2008-01-01" });
  assert.equal(result.profile.instant, "2008-01-01T14:00:00Z");
});
test("sin hora no inventa Ascendente, Medio Cielo ni casas", async () => {
  const result = await calculateNatal({ ...birth, timeKnown: false });
  assert.equal(result.profile.cusps, null);
  assert.equal(result.natal.Asc, undefined);
  assert.equal(result.natal.MC, undefined);
  assert.match(result.profile.warning!, /Hora desconocida/);
});
test("las horas inexistentes y ambiguas requieren corrección explícita", async () => {
  for (const [date, time] of [
    ["2026-03-08", "02:30"],
    ["2026-11-01", "01:30"],
  ])
    await assert.rejects(
      calculateNatal({ ...birth, date, time, timeZone: "America/New_York" }),
      /cambio horario/,
    );
});
test("el atlas local busca ciudades con o sin tildes", async () => {
  const result = await findPlaces("Cordoba");
  assert.ok(
    result.some(
      (city) =>
        city.country === "AR" && city.zone === "America/Argentina/Cordoba",
    ),
  );
  assert.equal((await findPlaces("B")).length, 0);
});
