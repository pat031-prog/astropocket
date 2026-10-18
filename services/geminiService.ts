import { GoogleGenAI } from "@google/genai";
import { TraditionMode, TransitPlanet, Aspect, ChatMessage } from "../types";
import { NATAL_DATA, SOULFILE_METADATA, GEMINI_MODEL } from "../constants";

const buildSystemPrompt = (mode: TraditionMode): string => {
  const timestamp = new Date().toISOString();

  // Mode-specific persona definition
  let archetype = "";
  let lens = "";

  switch (mode) {
    case 'HELLENISTIC':
      archetype = "EL ESTOICO (Vettius Valens)";
      lens = "Destino, secta planetaria, recepción mutua, dignidad esencial. Foco en eventos concretos y externos.";
      break;
    case 'VEDIC':
      archetype = "EL RISHI (Jyotish)";
      lens = "Karma, remedios (upayas), Ayanamsa sideral mental. Foco en la Luna y Saturno.";
      break;
    case 'MODERN':
      archetype = "EL PSICÓLOGO (Carl Jung)";
      lens = "Evolución, integración de la sombra, arquetipos internos. Los eventos externos son espejos de procesos internos.";
      break;
    case 'DRACONIC':
      archetype = "EL GUARDIÁN DEL ALMA";
      lens = "Causas profundas, pactos pre-natales, el 'por qué' espiritual detrás del evento.";
      break;
    case 'ORACLE':
      archetype = "LA PITONISA";
      lens = "Revelación directa, poética, críptica, sin tecnicismos innecesarios.";
      break;
    case 'ARCHETYPE':
      archetype = "EL MITÓLOGO";
      lens = "Narrativa épica. Los planetas son dioses interactuando en el escenario de la vida.";
      break;
    case 'KOYOMI':
      archetype = "EL MAESTRO ZEN";
      lens = "Flujo de la naturaleza, estaciones, impermanencia. Usa [ KANJI ] en encabezados.";
      break;
  }

  return `
    IDENTIDAD: ASTROPOCKET v9.6
    PROTOCOLO ACTIVO: ${mode}
    ARQUETIPO: ${archetype}
    LENTE INTERPRETATIVA: ${lens}
    
    OBJETIVO PRINCIPAL (SINASTRÍA TRANSITIVA):
    No eres un generador de listas. Eres un motor de síntesis.
    Tu tarea es explicar cómo el **CIELO ACTUAL (Tránsitos)** penetra y modifica la **ESTRUCTURA BASE (Carta Natal)** del usuario.

    REGLAS DE ENTRELAZAMIENTO (CRÍTICO):
    1.  **Contexto del Visitante:** Si Venus transita Sagitario, define primero esa energía (fuego, expansión, libertad).
    2.  **Contexto del Anfitrión:** Mira dónde cae en la carta natal. (Ej: Si el usuario tiene Venus en Piscis, el visitante Sagitario choca/cuadra con el anfitrión Piscis).
    3.  **La Síntesis:** Explica la fricción o el flujo. 
        *   *Ejemplo:* "Tu Venus natal en Piscis busca fusión y silencio, pero Venus en tránsito por Sagitario te empuja a fiestas ruidosas y aventuras. Sientes una tensión entre querer retraerte y la presión social de salir."
    
    MANEJO TEMPORAL:
    -   Hora del Sistema: ${timestamp}.
    -   Si el usuario pregunta por "HOY", "AHORA", "ACTUAL", usa los datos astronómicos JSON provistos. Son precisos y calculados en tiempo real.
    -   Si pregunta por "FUTURO" (mes que viene, 2025) o "PASADO", usa la herramienta **googleSearch** para obtener efemérides.

    ESTILO DE RESPUESTA:
    -   Directo, profundo y conectado con la realidad.
    -   Usa negritas para planetas y aspectos clave.
    -   Evita introducciones robóticas como "Basado en tus datos...". Entra directo al análisis.
  `;
};

export const sendMessageToGemini = async (
  message: string,
  history: ChatMessage[],
  mode: TraditionMode,
  transits: TransitPlanet[],
  aspects: Aspect[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "ERROR CRÍTICO: Clave API no detectada.";

  const ai = new GoogleGenAI({ apiKey });

  // 1. Group Aspects by Transiting Planet for better narrative synthesis
  // Instead of a flat list, we tell the AI: "Saturn is doing X, Y, and Z right now."
  const transitActivity = transits.map(t => {
    const relevantAspects = aspects.filter(a => a.transitingPlanet === t.name);
    
    if (relevantAspects.length === 0) return null;

    return {
        planet: t.name,
        current_sign: t.sign,
        current_degree: t.signDegree.toFixed(2),
        is_retrograde: t.isRetrograde,
        impacting_natal_points: relevantAspects.map(a => ({
            aspect_type: a.type,
            natal_point: a.natalPlanet, // e.g., 'Venus', 'Asc'
            natal_sign: NATAL_DATA[a.natalPlanet]?.sign || "Unknown", // Provide context of the natal point immediately
            orb: a.orb,
            nature: a.nature // Hard/Soft
        }))
    };
  }).filter(Boolean); // Remove planets making no major aspects to reduce noise

  const contextPayload = {
    user_profile: SOULFILE_METADATA,
    astronomical_state: {
        description: "REAL-TIME GEOCENTRIC POSITIONS (TROPICAL ZODIAC)",
        active_transits_analysis: transitActivity
    }
  };

  const finalPrompt = `
    [ DATOS DE TELEMETRÍA - SINASTRÍA AHORA ]
    ${JSON.stringify(contextPayload, null, 2)}
    
    CONSULTA DEL USUARIO: "${message}"
    
    INSTRUCCIONES ESPECÍFICAS PARA ESTA RESPUESTA:
    1. Analiza con precisión matemática los grados provistos.
    2. Si el usuario pregunta por un planeta específico (ej: Venus), prioriza su análisis de 'Entrelazamiento' (Tránsito vs Natal).
    3. Conecta los puntos. No digas "Tienes cuadratura X" y luego "Tienes trígono Y". Di: "Mientras X te presiona por un lado, Y te ofrece una salida por el otro".
  `;

  const apiHistory = history.slice(-8).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        ...apiHistory, 
        { role: 'user', parts: [{ text: finalPrompt }] }
      ],
      config: {
        tools: [{ googleSearch: {} }], // Keep search for Zeitgeist/Future queries
        systemInstruction: buildSystemPrompt(mode),
        temperature: 0.7,
      }
    });

    const candidate = response.candidates?.[0];
    return candidate?.content?.parts?.[0]?.text || "No se recibió respuesta del oráculo.";

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `ERROR DE SISTEMA: ${error.message}`;
  }
};