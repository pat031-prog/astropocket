import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createApiMiddleware } from "./api";
const root = process.cwd();
const dist = path.join(root, "dist");
const api = createApiMiddleware(root);
const types: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};
createServer(async (request, response) => {
  if (await api(request, response)) return;
  try {
    const pathname = decodeURIComponent(
      new URL(request.url || "/", "http://localhost").pathname,
    );
    const file = path.resolve(
      dist,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (
      !file.startsWith(dist + path.sep) ||
      pathname.split("/").some((part) => part.startsWith("."))
    ) {
      response.writeHead(403);
      response.end();
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": `${types[path.extname(file)] || "application/octet-stream"}; charset=utf-8`,
      "X-Content-Type-Options": "nosniff",
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("No encontrado");
  }
}).listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
  console.log(
    "AstroPocket disponible en http://127.0.0.1:" + (process.env.PORT || 4173),
  ),
);
