import { GuideAction, GuideState } from './types';

// Configuration
const COOLDOWN_MS = 20000; // 20 seconds between spoken messages

// Message Banks (Spanish Technical/Retro + Personality)
const MESSAGES = {
  FOCUS_INPUT: [
    "Oídos abiertos. ¿Cuál es el plan?",
    "Terminal lista. Ingresa datos.",
    "Captando frecuencia...",
    "¿Qué coordenadas buscamos?",
    "Aquí estoy. Escribe."
  ],
  START_COMPUTE: [
    "Desencriptando patrones estelares...",
    "Triangulando vectores...",
    "Consultando la base de datos akáshica...",
    "Esto requerirá potencia de cálculo...",
    "Procesando variables complejas..."
  ],
  COMPLETE_SUCCESS: [
    "¡Eureka! Datos alineados.",
    "Renderizado completo. Mira esto.",
    "Sincronización exitosa.",
    "El cosmos ha hablado.",
    "Visualización lista."
  ],
  ERROR: [
    "¡Alerta! Datos corruptos.",
    "No entiendo esa entrada.",
    "Interferencia detectada. Intenta de nuevo.",
    "Error de sintaxis en el vacío."
  ],
  NAVIGATE: [
    "Recalibrando sensores.",
    "Cambiando lente.",
    "Ajustando enfoque.",
    "Nueva perspectiva cargada."
  ],
  GIVE_HINT: [
    "Tip: Puedes hacer clic en los planetas del panel izquierdo para un análisis profundo.",
    "¿Probaste el modo DRACONIC? Revela la misión de tu alma.",
    "Si haces clic en un aspecto del panel derecho (Tránsitos), te explicaré cómo te afecta hoy.",
    "Pregúntame sobre tu Retorno de Saturno. Es un momento clave.",
    "No solo predigo, también analizo. Pregunta '¿Por qué me siento así hoy?'",
    "El modo KOYOMI usa sabiduría oriental antigua. Ideal para días confusos.",
    "Intenta preguntar: '¿Qué energía hay disponible para crear algo nuevo?'"
  ]
};

// Helper to get random message
const getRandomMsg = (key: keyof typeof MESSAGES) => {
  const bank = MESSAGES[key];
  return bank[Math.floor(Math.random() * bank.length)];
};

export const getNextState = (current: GuideState, action: GuideAction): GuideState => {
  switch (action) {
    case 'FOCUS_INPUT': return 'listening';
    case 'START_COMPUTE': return 'computing';
    case 'COMPLETE_SUCCESS': return 'success';
    case 'ERROR': return 'warning';
    case 'NAVIGATE': return 'scanning';
    case 'GIVE_HINT': return 'speaking';
    case 'IDLE_TIMEOUT': return 'idle';
    default: return 'idle';
  }
};

interface MachineState {
  lastSpeakTime: number;
}

const machineMemory: MachineState = {
  lastSpeakTime: 0
};

export const shouldSpeak = (action: GuideAction): boolean => {
  // Always speak on error, compute or explicit hint
  if (action === 'ERROR' || action === 'START_COMPUTE' || action === 'GIVE_HINT') return true;
  
  const now = Date.now();
  if (now - machineMemory.lastSpeakTime > COOLDOWN_MS) {
    machineMemory.lastSpeakTime = now;
    return true;
  }
  return false;
};

export const getMessageForAction = (action: GuideAction, customText?: string) => {
  if (customText) return customText;
  
  // Only some actions generate text automatically
  if (action in MESSAGES) {
    return getRandomMsg(action as keyof typeof MESSAGES);
  }
  return "";
};

export const resetCooldown = () => {
    machineMemory.lastSpeakTime = 0;
};