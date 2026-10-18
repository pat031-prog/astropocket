import type {
  ChatMessage,
  NatalChart,
  TraditionMode,
  TransitSearch,
  SkySnapshot,
} from "../types";
import { sessionHeaders } from "./session";
export interface ConnectionStatus {
  configured: boolean;
  provider: string;
  model: string;
  demo: boolean;
  localAvailable: boolean;
}
export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "meta"; model: string; date: string; engine?: string }
  | { type: "tool"; name: string; input: Record<string, unknown> }
  | { type: "status"; text: string }
  | { type: "sky"; date: string }
  | { type: "forecast"; result: TransitSearch }
  | { type: "error"; error: string }
  | { type: "done" };
export async function getConnection(): Promise<ConnectionStatus> {
  const response = await fetch("/api/status", { headers: sessionHeaders() });
  if (!response.ok) throw new Error("Servidor no disponible.");
  return response.json();
}
export async function getSky(
  natal: NatalChart,
  date: string,
  signal: AbortSignal,
): Promise<SkySnapshot> {
  const response = await fetch("/api/sky", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({ natal, date }),
    signal,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "No se pudo consultar el cielo.");
  return result;
}
export async function requestForecast(
  natal: NatalChart,
  from: string,
  to: string,
  planets: string[],
  signal?: AbortSignal,
): Promise<TransitSearch> {
  const response = await fetch("/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({ natal, from, to, planets }),
    signal,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "No se pudo calcular el intervalo.");
  return result;
}
export async function converse(
  payload: {
    messages: Pick<ChatMessage, "role" | "content">[];
    natal: NatalChart;
    natalContext?: {
      houseSystem: "P" | "W" | "E";
      cusps: number[] | null;
      warning?: string;
    };
    profileName: string;
    example?: boolean;
    date: string;
    mode: TraditionMode;
  },
  onEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionHeaders() },
    body: JSON.stringify({
      ...payload,
      messages: boundedHistory(payload.messages),
    }),
    signal,
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "La conexión no está disponible.");
  }
  if (!response.body) throw new Error("No se recibió la transmisión.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) if (line.trim()) onEvent(JSON.parse(line));
    }
    buffer += decoder.decode();
    if (buffer.trim()) onEvent(JSON.parse(buffer));
  } finally {
    reader.releaseLock();
  }
}

function boundedHistory(messages: Pick<ChatMessage, "role" | "content">[]) {
  const recent: typeof messages = [];
  let bytes = 0;
  const encoder = new TextEncoder();
  for (const message of messages.slice(-24).reverse()) {
    const size = encoder.encode(JSON.stringify(message)).byteLength;
    if (bytes + size > 120000) break;
    recent.unshift(message);
    bytes += size;
  }
  while (recent[0]?.role === "model") recent.shift();
  return recent;
}
