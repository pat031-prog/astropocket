import { NatalChart, SoulfileMetadata } from './types';

// ============================================================================
// CONFIGURATION AREA
// ============================================================================

export const GEMINI_MODEL = "gemini-2.5-flash";

// ============================================================================
// SOULFILE (USER DNA)
// ============================================================================

export const NATAL_DATA: NatalChart = {
    // Public example: 2000-01-01, 12:00, Buenos Aires (Swiss Ephemeris).
    Sol: { sign: 'Capricornio', deg: 10.49634864773634 },
    Luna: { sign: 'Escorpio', deg: 14.825279931892595 },
    Asc: { sign: 'Piscis', deg: 27.65369193753986 },
    Mercurio: { sign: 'Capricornio', deg: 2.0838503059920868 },
    Venus: { sign: 'Sagitario', deg: 1.7169275689063 },
    Marte: { sign: 'Acuario', deg: 28.060261954616976 },
    Saturno: { sign: 'Tauro', deg: 10.393184665169564, retrograde: true },
    Jupiter: { sign: 'Aries', deg: 25.258208736783654 },
    Urano: { sign: 'Acuario', deg: 14.815484144736047 },
    Neptuno: { sign: 'Acuario', deg: 3.197461202630393 },
    Pluton: { sign: 'Sagitario', deg: 11.45917154002484 },
    NodoN: { sign: 'Leo', deg: 3.9470833226383064, retrograde: true }
};

export const SOULFILE_METADATA: SoulfileMetadata = {
    identidad: "Piloto de ejemplo",
    localizacion: "Sin configurar",
    perfil: "Exploración de la carta y los ciclos personales.",
    enfoque: "Conversación y reflexión simbólica.",
    usoDelSistema: "Herramienta de observación, no predicción literal.",
    marcoEtico: "Lecturas interpretativas, no deterministas.",
    idioma: "Español"
};

// ============================================================================
// ASTROLOGY CONSTANTS
// ============================================================================

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const PLANET_GLYPHS: Record<string, string> = {
  'Sol': '☉', 'Sun': '☉',
  'Luna': '☽', 'Moon': '☽',
  'Mercurio': '☿', 'Mercury': '☿',
  'Venus': '♀',
  'Marte': '♂', 'Mars': '♂',
  'Jupiter': '♃',
  'Saturno': '♄', 'Saturn': '♄',
  'Urano': '♅', 'Uranus': '♅',
  'Neptuno': '♆', 'Neptune': '♆',
  'Pluton': '♇', 'Pluto': '♇',
  'Asc': 'Asc', 'MC': 'MC',
  'NodoN': '☊'
};

export const ZODIAC_GLYPHS: string[] = [
  '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
];

// Map Spanish names in NATAL_DATA to English standard for logic if needed, 
// or mapped to Astronomy Engine body names.
export const PLANET_MAPPING: Record<string, string> = {
  'Sol': 'Sun',
  'Luna': 'Moon',
  'Mercurio': 'Mercury',
  'Venus': 'Venus',
  'Marte': 'Mars',
  'Jupiter': 'Jupiter',
  'Saturno': 'Saturn',
  // Outer planets for modern context
  'Urano': 'Uranus',
  'Neptuno': 'Neptune',
  'Pluton': 'Pluto'
};
