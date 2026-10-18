// Data Models
export interface NatalPlanet {
  sign: string;
  deg: number;
  house?: number;
  retrograde?: boolean;
}
export interface BirthPlace {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  zone: string;
}
export interface NatalProfile {
  birth: {
    date: string;
    time: string;
    timeKnown: boolean;
    place: BirthPlace;
    timeZone: string;
    houseSystem: "P" | "W" | "E";
    nodeType?: "mean" | "true";
  };
  instant: string;
  cusps: number[] | null;
  ascendant?: number;
  midheaven?: number;
  warning?: string;
  engine: string;
}

export interface NatalChart {
  [key: string]: NatalPlanet;
}

export interface TransitPlanet {
  name: string;
  longitude: number; // 0-360 Ecliptic Longitude
  sign: string;
  signDegree: number; // 0-30
  isRetrograde: boolean;
  speed?: number;
}

export interface Aspect {
  transitingPlanet: string;
  natalPlanet: string;
  type: "Conjunction" | "Opposition" | "Square" | "Trine" | "Sextile";
  orb: number;
  nature: "Hard" | "Soft" | "Neutral";
  angleDiff: number;
  applying?: boolean;
}

export type TraditionMode =
  | "HELLENISTIC"
  | "VEDIC"
  | "MODERN"
  | "ORACLE"
  | "ARCHETYPE"
  | "KOYOMI"
  | "DRACONIC";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
  mode?: TraditionMode;
  contextDate?: string;
  tools?: string[];
  error?: boolean;
  inProgress?: boolean;
  contextRange?: { from: string; to: string };
  engine?: string;
  natalSource?: string;
}

export interface SkySnapshot {
  date: string;
  engine: {
    name: string;
    version: string;
    dataset?: string;
    reference?: string;
  };
  transits: TransitPlanet[];
  aspects: Aspect[];
}

export interface TransitEvent {
  id: string;
  date: string;
  transitingPlanet: string;
  natalPlanet: string;
  type: Aspect["type"];
  longitude: number;
  retrograde: boolean;
  orb: number;
}
export interface TransitSearch {
  from: string;
  to: string;
  planets: string[];
  events: TransitEvent[];
  total: number;
  truncated: boolean;
}

export interface SoulfileMetadata {
  identidad: string;
  localizacion: string;
  perfil: string;
  enfoque: string;
  usoDelSistema: string;
  marcoEtico: string;
  idioma: string;
}

// Global declaration for the CDN library
declare global {
  interface Window {
    Astronomy: any;
  }
}
