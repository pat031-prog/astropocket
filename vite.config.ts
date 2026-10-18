import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createApiMiddleware } from "./server/api";
export default defineConfig({
  worker: { format: "es" },
  server: {
    port: 4173,
    host: "127.0.0.1",
    headers: { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "credentialless" },
    fs: {
      deny: [".env", ".env.*", "**/.git/**", "**/.astropocket/**", "**/*.pem"],
    },
  },
  plugins: [
    react(),
    {
      name: "astropocket-api",
      configureServer(server) {
        server.middlewares.use(createApiMiddleware(process.cwd()));
      },
      configurePreviewServer(server) {
        server.middlewares.use(createApiMiddleware(process.cwd()));
      },
    },
  ],
  resolve: { alias: { "@": path.resolve(process.cwd(), ".") } },
});
