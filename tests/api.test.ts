import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer, request, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApiMiddleware } from "../server/api";

let server: Server;
let base: string;
before(async () => {
  const api = createApiMiddleware(process.cwd());
  server = createServer((req, res) => {
    void api(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
test("el estado de conexión no revela credenciales", async () => {
  const response = await fetch(base + "/api/status");
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(body).provider, "Anthropic");
  assert.ok(!/sk-ant-|apiKey|ANTHROPIC_API_KEY/.test(body));
});
test("rechaza un origen externo y un Host ajeno a localhost", async () => {
  assert.equal(
    (
      await fetch(base + "/api/status", {
        headers: { Origin: "https://external.example" },
      })
    ).status,
    403,
  );
  const hostStatus = await new Promise<number>((resolve) => {
    const req = request(
      base + "/api/status",
      { headers: { Host: "external.example" } },
      (response) => {
        response.resume();
        resolve(response.statusCode!);
      },
    );
    req.end();
  });
  assert.equal(hostStatus, 403);
});
test("rechaza fechas sin zona, imposibles y cartas inválidas", async () => {
  for (const from of [
    "2027-01-01T00:00:00",
    "2027-02-30T00:00:00Z",
    "2200-01-01T00:00:00Z",
  ]) {
    const response = await fetch(base + "/api/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        natal: { Sol: { sign: "Aries", deg: 0 } },
        from,
        to: "2027-03-01T00:00:00Z",
      }),
    });
    assert.equal(response.status, 400, from);
  }
  const response = await fetch(base + "/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      natal: { Sol: { sign: "Inventado", deg: 0 } },
      from: "2027-01-01T00:00:00Z",
      to: "2027-03-01T00:00:00Z",
    }),
  });
  assert.equal(response.status, 400);
});
test("el API devuelve contactos calculados y sin truncamiento para una ventana breve", async () => {
  const response = await fetch(base + "/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      natal: { Sol: { sign: "Aries", deg: 0 } },
      from: "2026-03-19T00:00:00Z",
      to: "2026-03-22T00:00:00Z",
      planets: ["Sun"],
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.total, 1);
  assert.equal(body.truncated, false);
  assert.equal(body.events[0].type, "Conjunction");
});
