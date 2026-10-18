import { test } from "node:test";
import assert from "node:assert/strict";
import { relayReading } from "../server/readingStream";
async function* parts(values: Parameters<typeof relayReading>[0] extends AsyncIterable<infer T> ? T[] : never) { yield* values; }
test("una promesa seguida de herramientas y un corte de razonamiento no cuenta como lectura", async () => {
  const outcome = await relayReading(parts([
    { type: "start-step" }, { type: "text-delta", text: "Voy a buscar los contactos." },
    { type: "tool-call", toolName: "findContacts", input: {} }, { type: "finish-step", finishReason: "tool-calls" },
    { type: "start-step" }, { type: "reasoning-delta" }, { type: "finish-step", finishReason: "length" },
  ]), () => {});
  assert.equal(outcome.complete, false); assert.equal(outcome.finalText, ""); assert.equal(outcome.finishReason, "length");
});
test("la lectura posterior a los cálculos sí cierra el turno", async () => {
  const events: unknown[] = [];
  const outcome = await relayReading(parts([
    { type: "start-step" }, { type: "tool-call", toolName: "findContacts", input: { from: "2026-10-17" } },
    { type: "finish-step", finishReason: "tool-calls" }, { type: "start-step" },
    { type: "text-delta", text: "El contacto exacto se produce el 23 de octubre." }, { type: "finish-step", finishReason: "stop" },
  ]), e => events.push(e));
  assert.equal(outcome.complete, true); assert.match(outcome.finalText, /23 de octubre/); assert.equal(events.length, 2);
});
test("agotar los pasos con herramientas no da un falso éxito", async () => {
  const outcome = await relayReading(parts([{type:"start-step"},{type:"text-delta",text:"Ahora sí."},{type:"finish-step",finishReason:"tool-calls"}]), () => {});
  assert.equal(outcome.complete, false);
});
test("detener una lectura no se confunde con un cierre que debe repararse", async () => {
  const outcome = await relayReading(parts([{type:"start-step"},{type:"abort"}]), () => {});
  assert.equal(outcome.aborted, true); assert.equal(outcome.complete, false);
});
