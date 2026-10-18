import { forgetConnection, rememberConnection } from "./credentialVault";
// Runtime requests use memory. Optional persistence is encrypted in a separate IndexedDB vault.
let apiKey = "";
export const sessionHeaders = (): Record<string,string> => apiKey ? { "x-astropocket-key": apiKey } : {};
export function setSessionKey(value: string) { apiKey = value; }
export async function disconnectSession() { apiKey = ""; await forgetConnection().catch(()=>{}); window.dispatchEvent(new Event("astropocket:disconnect")); }
export async function connectSession(key: string, useLocal = false, remember = true) {
  const response = await fetch("/api/session", {
    method: "POST", headers: { "Content-Type":"application/json", ...(key ? {"x-astropocket-key":key} : {}) },
    body: JSON.stringify({ useLocal }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No pudimos abrir la conexión.");
  setSessionKey(key);
  let remembered = false;
  try {
    if(remember) {await rememberConnection(useLocal?{kind:"local"}:{kind:"key",key});remembered=true;}
    else await forgetConnection();
  } catch { /* The connection remains active in memory when storage is unavailable. */ }
  return {...result,remembered};
}
