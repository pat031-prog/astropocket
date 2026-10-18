export const THEMES = [
  { id: "nebula", name: "Nebulosa", label: "LA SEÑAL ORIGINAL", note: "Violeta profundo, cian y vidrio de nave.", colors: ["#100b19", "#deb5fa", "#83d4e8"] },
  { id: "garden", name: "Jardín LCD", label: "UNA CONSOLA AL SOL", note: "Marfil, verde bosque y memoria de bolsillo.", colors: ["#f3f0e4", "#245346", "#c7d6b7"] },
  { id: "observatory", name: "Observatorio", label: "TURNO DE NOCHE", note: "Grafito, ámbar y un cielo de cobre.", colors: ["#15191a", "#f3c180", "#8fc9c2"] },
] as const;
export type AppTheme = (typeof THEMES)[number]["id"];
export type ReadingSize = "comfortable" | "large" | "extra";
export type AppearancePanel = "nova" | "theme" | "reading";
export interface Appearance { theme: AppTheme; reading: ReadingSize; calm: boolean }
export function restoreAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem("astropocket.appearance.v1") || "null");
    return {
      theme: THEMES.find(t => t.id === saved?.theme)?.id || "nebula",
      reading: ["comfortable", "large", "extra"].includes(saved?.reading) ? saved.reading : "comfortable",
      calm: saved?.calm === true,
    };
  } catch { return { theme: "nebula", reading: "comfortable", calm: false }; }
}
