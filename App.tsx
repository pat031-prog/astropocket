import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Aspect,
  ChatMessage,
  NatalChart,
  NatalProfile,
  TraditionMode,
  TransitEvent,
  TransitSearch,
  SkySnapshot,
} from "./types";
import { NATAL_DATA } from "./constants";
import {
  MODES,
  aspectName,
  planetName,
  signIndex,
} from "./services/astroDisplay";
import { validDate } from "./services/astronomyService";
import {
  converse,
  getConnection,
  getSky,
  requestForecast,
  type ConnectionStatus,
} from "./services/terminalApi";
import Conversation from "./components/Conversation";
import Chronoscope from "./components/Chronoscope";
import Soulfile from "./components/Soulfile";
import NovaCompanion, {
  type NovaActivity,
  type NovaCue,
} from "./components/NovaCompanion";
import ConnectionDialog from "./components/ConnectionDialog";
import NovaCollection from "./components/NovaCollection";
import SessionGate from "./components/SessionGate";
import { NOVAS, type NovaDesign } from "./components/NovaShell";
import { restoreAppearance, type AppearancePanel } from "./services/appearance";
import "./index.css";
import "./styles/experience.css";
import "./styles/wardrobe.css";
import "./styles/themes.css";
import "./styles/session.css";

const STORAGE = "astropocket.console.v2";
function isDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    validDate(value);
    return true;
  } catch {
    return false;
  }
}
function cleanHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (m) =>
        m &&
        typeof m.id === "string" &&
        ["user", "model"].includes(m.role) &&
        typeof m.content === "string" &&
        Number.isFinite(new Date(m.timestamp).getTime()),
    )
    .slice(-100)
    .map((m) => ({
      ...m,
      tools: Array.isArray(m.tools)
        ? m.tools.filter((t) => typeof t === "string").slice(0, 20)
        : [],
      contextDate: isDate(m.contextDate) ? m.contextDate : undefined,
      contextRange:
        isDate(m.contextRange?.from) && isDate(m.contextRange?.to)
          ? m.contextRange
          : undefined,
      ...(m.inProgress
        ? {
            inProgress: false,
            error: true,
            content:
              m.content +
              "\n\n_Transmisión interrumpida al cerrar la consola. Podés reintentar._",
          }
        : {}),
    }));
}
function restore() {
  const fallback = {
    name: "Tu carta",
    natal: NATAL_DATA,
    messages: [] as ChatMessage[],
    mode: "MODERN" as TraditionMode,
    chosenDate: null as string | null,
    forecast: null as TransitSearch | null,
    natalProfile: null as NatalProfile | null,
    example: true,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (
      !saved ||
      !saved.natal ||
      !Object.keys(saved.natal).length ||
      Object.keys(saved.natal).length > 20
    )
      return fallback;
    const natal = saved.natal as NatalChart;
    if (
      Object.values(natal).some(
        (value) =>
          !value ||
          typeof value.sign !== "string" ||
          signIndex(value.sign) < 0 ||
          !Number.isFinite(value.deg) ||
          value.deg < 0 ||
          value.deg >= 30,
      )
    )
      return fallback;
    const messages = cleanHistory(saved.messages);
    const forecast = saved.forecast;
    const validForecast =
      forecast &&
      isDate(forecast.from) &&
      isDate(forecast.to) &&
      Array.isArray(forecast.events) &&
      forecast.events.length <= 100 &&
      forecast.events.every(
        (event) =>
          event &&
          isDate(event.date) &&
          typeof event.id === "string" &&
          typeof event.transitingPlanet === "string" &&
          typeof event.natalPlanet === "string" &&
          ["Conjunction", "Opposition", "Square", "Trine", "Sextile"].includes(
            event.type,
          ),
      ) &&
      Array.isArray(forecast.planets) &&
      forecast.planets.every((p) => typeof p === "string") &&
      Number.isFinite(forecast.total);
    return {
      name:
        typeof saved.name === "string"
          ? saved.name.slice(0, 100)
          : fallback.name,
      natal,
      example: saved.example === true,
      messages,
      chosenDate: isDate(saved.chosenDate) ? saved.chosenDate : null,
      forecast: validForecast ? (forecast as TransitSearch) : null,
      natalProfile:
        saved.natalProfile &&
        isDate(saved.natalProfile.instant) &&
        saved.natalProfile.birth?.place?.name &&
        (saved.natalProfile.cusps === null ||
          (Array.isArray(saved.natalProfile.cusps) &&
            saved.natalProfile.cusps.length === 12 &&
            saved.natalProfile.cusps.every(
              (value) => Number.isFinite(value) && value >= 0 && value < 360,
            )))
          ? (saved.natalProfile as NatalProfile)
          : null,
      mode: MODES.some((mode) => mode.id === saved.mode)
        ? (saved.mode as TraditionMode)
        : fallback.mode,
    };
  } catch {
    return fallback;
  }
}
export default function App() {
  return <SessionGate><AstroConsole /></SessionGate>;
}
function AstroConsole() {
  const [initial] = useState(restore);
  const [name, setName] = useState(initial.name);
  const [natal, setNatal] = useState(initial.natal);
  const [natalProfile, setNatalProfile] = useState(initial.natalProfile);
  const [example, setExample] = useState(initial.example);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [mode, setMode] = useState<TraditionMode>(initial.mode);
  const [input, setInput] = useState(() => {
    try { return (localStorage.getItem("astropocket.draft") || "").slice(0, 8000); } catch { return ""; }
  });
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [readingAloud,setReadingAloud]=useState(false);
  const [stage, setStage] = useState("");
  const [sound, setSound] = useState(false);
  const [solo, setSolo] = useState(() => {
    try {
      return localStorage.getItem("astropocket.solo") === "true";
    } catch {
      return false;
    }
  });
  const [design, setDesign] = useState<NovaDesign>(() => {
    try {
      const saved = localStorage.getItem("astropocket.nova");
      return NOVAS.find((nova) => nova.id === saved)?.id || "classic";
    } catch {
      return "classic";
    }
  });
  const collection = useRef<HTMLDialogElement>(null);
  const [appearance, setAppearance] = useState(restoreAppearance);
  const [appearancePanel, setAppearancePanel] = useState<AppearancePanel>("nova");
  const openAppearance = (panel: AppearancePanel = "nova") => {
    setAppearancePanel(panel);
    collection.current?.showModal();
  };
  useEffect(() => {
    try { localStorage.setItem("astropocket.appearance.v1", JSON.stringify(appearance)); } catch { /* Appearance is optional. */ }
  }, [appearance]);
  useEffect(() => {
    try { localStorage.setItem("astropocket.draft", input); } catch { /* The live draft remains available. */ }
  }, [input]);
  const toggleSolo = () => {
    setSolo((value) => !value);
    setView("chat");
  };
  useEffect(() => {
    try {
      localStorage.setItem("astropocket.solo", String(solo));
      localStorage.setItem("astropocket.nova", design);
    } catch {
      /* Preferences are optional. */
    }
  }, [solo, design]);
  useEffect(() => {
    if (!solo) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]"))
        setSolo(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [solo]);
  const [now, setNow] = useState(new Date().toISOString());
  const [chosenDate, setChosenDate] = useState<string | null>(
    initial.chosenDate,
  );
  const date = chosenDate || now;
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [view, setView] = useState("chat");
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [forecast, setForecast] = useState<TransitSearch | null>(
    initial.forecast,
  );
  const [previous, setPrevious] = useState<ChatMessage[]>(() => {
    try {
      return cleanHistory(
        JSON.parse(
          localStorage.getItem("astropocket.previous-session") || "null",
        ),
      );
    } catch {
      return [];
    }
  });
  const [forecastBusy, setForecastBusy] = useState(false);
  const [forecastError, setForecastError] = useState("");
  const [cue, setCue] = useState<NovaCue>({
    id: 0,
    text: "Sistema listo. ¿Hacia dónde miramos?",
  });
  const [chatActivity, setChatActivity] = useState<NovaActivity>("idle");
  const pending = useRef<AbortController | null>(null);
  const scan = useRef<AbortController | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sky, setSky] = useState<SkySnapshot | null>(null);
  const [skyError, setSkyError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setSkyError("");
    setSky(null);
    void getSky(natal, date, controller.signal)
      .then(setSky)
      .catch((error) => {
        if (!controller.signal.aborted)
          setSkyError(
            error instanceof Error
              ? error.message
              : "El cielo no está disponible.",
          );
      });
    return () => controller.abort();
  }, [date, natal]);
  const refreshConnection = () => {
    void getConnection()
      .then(setConnection)
      .catch(() => setConnection(null));
  };
  const tellNova = (text: string, mood: NovaActivity = "idle") =>
    setCue({ id: Date.now(), text, mood });
  const announce = (text: string) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 7000);
  };
  useEffect(() => {
    refreshConnection();
    const timer = setInterval(() => setNow(new Date().toISOString()), 60000);
    return () => {
      clearInterval(timer);
      pending.current?.abort();
      scan.current?.abort();
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify({
          name,
          natal,
          mode,
          messages: messages.slice(-100),
          chosenDate,
          forecast,
          natalProfile,
          example,
        }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [name, natal, mode, messages, chosenDate, forecast, natalProfile, example]);
  useEffect(() => {
    if (!cue.mood || cue.mood === "idle") return;
    const timer = setTimeout(
      () =>
        setCue((current) =>
          current.id === cue.id ? { ...current, mood: "idle" } : current,
        ),
      3500,
    );
    return () => clearTimeout(timer);
  }, [cue.id]);
  const chooseDate = (value: string | null) => {
    try {
      if (value) validDate(value);
      setChosenDate(value);
      tellNova(
        value
          ? "Salto temporal listo. Esa fecha ya está en el visor."
          : "De vuelta al presente. Antenas calibradas.",
      );
    } catch {
      announce("El cronoscopio trabaja entre 1900 y 2100.");
    }
  };
  const suggest = (text: string) => {
    setInput(text);
    setView("chat");
    tellNova("Lo dejamos en el canal. Cuando quieras, enviá.");
    setTimeout(() => document.getElementById("pilot-input")?.focus(), 0);
  };
  const askAspect = (aspect: Aspect) =>
    suggest(
      `Para el ${new Date(date).toLocaleString("es-AR", { timeZone: "Etc/GMT+3" })} ART, hablemos de ${planetName(aspect.transitingPlanet)} en tránsito en ${aspectName(aspect.type).toLowerCase()} a mi ${planetName(aspect.natalPlanet)} natal (orbe ${aspect.orb.toFixed(2)}°). ¿Cómo lo puedo trabajar?`,
    );
  const askEvent = (event: TransitEvent) => {
    chooseDate(event.date);
    suggest(
      `Analicemos el contacto exacto de ${planetName(event.transitingPlanet)} en ${aspectName(event.type).toLowerCase()} a mi ${planetName(event.natalPlanet)} natal del ${new Date(event.date).toLocaleString("es-AR", { timeZone: "Etc/GMT+3" })} ART. ¿Qué temas abre y cómo se conecta con mi carta?`,
    );
  };
  const explore = async (days: number, planets: string[]) => {
    scan.current?.abort();
    const controller = new AbortController();
    scan.current = controller;
    setForecastBusy(true);
    setForecastError("");
    tellNova("Voy a rastrear contactos en esa ventana.", "scanning");
    try {
      const result = await requestForecast(
        natal,
        date,
        new Date(Date.parse(date) + days * 86400000).toISOString(),
        planets,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setForecast(result);
        tellNova(
          `${result.total} ${result.total === 1 ? "contacto" : "contactos"} en el radar. Tocá uno y lo charlamos.`,
          "success",
        );
      }
    } catch (reason) {
      if (!controller.signal.aborted)
        setForecastError(
          reason instanceof Error
            ? reason.message
            : "No pudimos explorar el intervalo.",
        );
    } finally {
      if (scan.current === controller) {
        setForecastBusy(false);
        scan.current = null;
      }
    }
  };
  const send = async (retry = false) => {
    if (pending.current) return;
    const lastError = messages.at(-1);
    const previousUser = messages.at(-2);
    const text =
      retry && lastError?.error && previousUser?.role === "user"
        ? previousUser.content
        : input.trim();
    if (!text) return;
    const history = retry ? messages.slice(0, -2) : messages;
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const requestDate =
      retry && lastError?.contextDate ? lastError.contextDate : date;
    const requestMode = retry && lastError?.mode ? lastError.mode : mode;
    const answer: ChatMessage = {
      natalSource: example ? "Carta de ejemplo · cargá tu nacimiento" : natalProfile
        ? "Calculada con Swiss Ephemeris" +
          (natalProfile.birth.timeKnown
            ? " · casas calculadas"
            : " · sin hora exacta")
        : "Posiciones guardadas del Soulfile",
      id: crypto.randomUUID(),
      role: "model",
      content: "",
      timestamp: Date.now(),
      contextDate: requestDate,
      mode: requestMode,
      tools: [],
      inProgress: true,
    };
    const controller = new AbortController();
    pending.current = controller;
    setMessages([...history, user, answer]);
    setInput("");
    setBusy(true);
    setChatActivity("scanning");
    setStage("ABRIENDO CANAL CON NOVA");
    let failed = false;
    let received = false;
    let newSection = false;
    const update = (apply: (message: ChatMessage) => ChatMessage) =>
      setMessages((current) =>
        current.map((message) =>
          message.id === answer.id ? apply(message) : message,
        ),
      );
    try {
      await converse(
        {
          messages: [
            ...history.filter((message) => !message.error && message.content),
            user,
          ]
            .slice(-24)
            .map(({ role, content }) => ({ role, content })),
          natal,
          ...(natalProfile
            ? {
                natalContext: {
                  houseSystem: natalProfile.birth.houseSystem,
                  cusps: natalProfile.cusps,
                  warning: natalProfile.warning,
                },
              }
            : {}),
          profileName: name,
          example,
          date: requestDate,
          mode: requestMode,
        },
        (event) => {
          if (event.type === "meta") {
            update((message) => ({ ...message, engine: event.engine }));
          } else if (event.type === "text") {
            const separator = newSection ? "\n\n" : "";
            newSection = false;
            received = true;
            setChatActivity("speaking");
            update((message) => ({
              ...message,
              content: message.content + separator + event.text,
            }));
          } else if (event.type === "status") {
            setStage(event.text);
          } else if (event.type === "tool") {
            newSection = received;
            setChatActivity("scanning");
            setStage(
              event.name === "findContacts"
                ? "RASTREANDO CONTACTOS EN EL TIEMPO"
                : "CONSULTANDO POSICIONES PLANETARIAS",
            );
            update((message) => ({
              ...message,
              tools: [...(message.tools || []), event.name],
            }));
          } else if (event.type === "sky") {
            setChosenDate(event.date);
            update((message) => ({ ...message, contextDate: event.date }));
          } else if (event.type === "forecast") {
            setForecast(event.result);
            setForecastError("");
            update((message) => ({
              ...message,
              contextRange: { from: event.result.from, to: event.result.to },
            }));
          } else if (event.type === "error") {
            failed = true;
            update((message) => ({
              ...message,
              error: true,
              content:
                (message.content ? message.content + "\n\n" : "") + event.error,
            }));
          }
        },
        controller.signal,
      );
      if (!received && !failed)
        throw new Error(
          "La transmisión terminó sin respuesta. Podés reintentar.",
        );
      tellNova(
        failed
          ? "Se cortó el enlace. Podemos volver a intentarlo."
          : "Lectura recibida. Seguimos cuando quieras.",
        failed ? "warning" : "success",
      );
    } catch (reason) {
      if (controller.signal.aborted)
        update((message) => ({
          ...message,
          error: true,
          content: message.content
            ? message.content + "\n\n_Transmisión detenida._"
            : "Transmisión detenida. Podés reintentar cuando quieras.",
        }));
      else {
        update((message) => ({
          ...message,
          error: true,
          content:
            (message.content ? message.content + "\n\n" : "") +
            (reason instanceof Error
              ? reason.message
              : "No pudimos completar la consulta."),
        }));
        tellNova("Hubo interferencia en el canal.", "warning");
      }
    } finally {
      update((message) => ({ ...message, inProgress: false }));
      pending.current = null;
      setBusy(false);
      setChatActivity("idle");
      setStage("");
    }
  };
  const exportLog = () => {
    const text =
      `ASTROPOCKET / ${name}\n\n` +
      messages
        .map(
          (message) =>
            `${message.role === "user" ? name : "NOVA"} · ${new Date(message.timestamp).toLocaleString("es-AR")}\n${message.contextDate ? "Cielo: " + message.contextDate + "\n" : ""}${message.content}`,
        )
        .join("\n\n———\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `astropocket-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const activity: NovaActivity = busy
    ? chatActivity
    : forecastBusy
      ? "scanning"
      : readingAloud
        ? "speaking"
      : focused
        ? "listening"
        : cue.mood || "idle";
  return (
    <div
      className={`astropocket view-${view} ${messages.length ? "has-messages" : ""} ${solo ? "companion-mode" : ""}`}
      data-theme={appearance.theme}
      data-reading={appearance.reading}
      data-calm={appearance.calm}
    >
      <NovaCollection
        current={design}
        dialog={collection}
        appearance={appearance}
        onAppearance={setAppearance}
        panel={appearancePanel}
        onPanel={setAppearancePanel}
        onChoose={(value) => {
          setDesign(value);
          tellNova("Misma memoria. Nuevo traje para el viaje.", "success");
        }}
      />
      <a className="skip-link" href="#pilot-input">
        Ir a la conversación
      </a>
      <header className="console-masthead">
        <div className="brand-mark" aria-hidden="true">
          ✳
        </div>
        <div className="brand">
          <strong>
            ASTRO<span>POCKET</span>
            <sup>®</sup>
          </strong>
          <small>PERSONAL ASTROLOGY CONSOLE / UNIT—09</small>
        </div>
        <div className="masthead-frequency">
          <span className="signal-bars">▂▄▆</span> DEEP SPACE / LOCAL SIGNAL
        </div>
        <div className="masthead-controls">
          <button className="appearance-open" aria-label="Personalizar Nova, temas y lectura" title="Personalizar tu AstroPocket" onClick={() => openAppearance("theme")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4 1.6 1.6 0 0 1 1.1-2.7h1A4 4 0 0 0 21 11c0-4.5-4-8-9-8Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/></svg><span>ESTILO</span>
          </button>
          <button
            className="sound-toggle"
            aria-label={sound ? "Desactivar sonido" : "Activar sonido"}
            aria-pressed={sound}
            onClick={() => {
              setSound(!sound);
              tellNova(
                !sound
                  ? "Sonido listo. Tocame para escuchar."
                  : "Modo silencioso activado.",
              );
            }}
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              {sound ? (
                <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
              ) : (
                <path d="m16 9 5 6m0-6-5 6" />
              )}
            </svg>
            <span>SONIDO</span>
          </button>
          <ConnectionDialog status={connection} onSaved={refreshConnection} />
          <time>
            {new Date(now).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Etc/GMT+3",
            })}
            <small>ART</small>
          </time>
        </div>
      </header>
      <nav className="mobile-navigation" aria-label="Paneles de la consola">
        {[
          ["natal", "01", "CARTA"],
          ["chat", "✳", "NOVA"],
          ["sky", "02", "CIELO"],
        ].map(([id, number, label]) => (
          <button
            key={id}
            className={view === id ? "selected" : ""}
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
              tellNova(
                id === "sky"
                  ? "El tiempo está en tus manos."
                  : id === "natal"
                    ? "Tu mapa de origen. Ahí empezó el viaje."
                    : "Acá estoy.",
              );
            }}
          >
            <span>{number}</span>
            {label}
          </button>
        ))}
      </nav>
      <main className="console-grid">
        <Soulfile
          example={example}
          name={name}
          natal={natal}
          profile={natalProfile}
          onSave={(nextName, chart, nextProfile) => {
            setName(nextName);
            setNatal(chart);
            setExample(false);
            setNatalProfile(nextProfile || null);
            setForecast(null);
            tellNova(
              "Soulfile actualizado. Recalibré los contactos.",
              "success",
            );
          }}
          onChoose={suggest}
        />
        <section
          className="console-panel channel-panel"
          aria-label="Canal con Nova"
        >
          <div className="module-heading channel-heading">
            <span className="channel-title">
              {solo ? "VOS + NOVA" : "NOVA / ORÁCULO"}
            </span>
            <div>
              <button
                aria-label="Elegir diseño de Nova"
                title="Colección de Novas"
                onClick={() => openAppearance("nova")}
              >
                ◈
              </button>
              <button
                className="solo-toggle"
                aria-label={
                  solo ? "Volver a la consola" : "Abrir modo sólo Nova"
                }
                aria-pressed={solo}
                title={
                  solo
                    ? "Volver a la consola · Escape"
                    : "Sólo Nova · también con doble clic"
                }
                onClick={toggleSolo}
              >
                {solo ? "↙" : "↗"}
                <span>{solo ? "CONSOLA" : "SÓLO NOVA"}</span>
              </button>
              {!messages.length && previous.length > 0 && (
                <button
                  aria-label="Retomar conversación anterior"
                  onClick={() => {
                    setMessages(previous);
                    tellNova("Retomamos donde habíamos dejado.");
                  }}
                >
                  ↶ RETOMAR
                </button>
              )}
              <button
                aria-label="Exportar conversación"
                title="Exportar conversación"
                disabled={!messages.length}
                onClick={exportLog}
              >
                ↓<span className="tool-word"> TXT</span>
              </button>
              <button
                aria-label="Nueva conversación"
                title="Archivar e iniciar una conversación"
                disabled={busy || !messages.length}
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "astropocket.previous-session",
                      JSON.stringify(messages),
                    );
                  } catch {
                    announce(
                      "No se pudo archivar. Exportá la conversación antes de empezar otra.",
                    );
                    return;
                  }
                  setMessages([]);
                  setPrevious(messages);
                  tellNova("Un capítulo nuevo. Te escucho.");
                }}
              >
                +<span className="tool-word"> NUEVA</span>
              </button>
            </div>
          </div>
          <div className="channel-context">
            <span className="context-date">
              {chosenDate ? "◷" : "●"}{" "}
              {new Date(date).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "Etc/GMT+3",
              })}
              <small>{chosenDate ? "EXPLORACIÓN" : "AHORA"}</small>
            </span>
            <label>
              LENTE
              <select
                aria-label="Lente interpretativa"
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value as TraditionMode);
                  tellNova(
                    "Cambiamos la mirada. El cielo sigue siendo tropical.",
                  );
                }}
              >
                {MODES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {mode !== "MODERN" && (
            <p className="lens-note">
              Perspectiva simbólica{" "}
              {MODES.find((option) => option.id === mode)?.name.toLowerCase()} ·
              datos tropicales, sin conversión de sistema.
            </p>
          )}
          <Conversation
            example={example}
            messages={messages}
            input={input}
            onInput={setInput}
            onSend={() => void send()}
            busy={busy}
            onCancel={() => pending.current?.abort()}
            onFocus={setFocused}
            onSuggest={suggest}
            stage={stage}
            onVoiceActivity={setReadingAloud}
          >
            <div className="nova-slot">
              {!busy && messages.at(-1)?.error && (
                <button
                  className="retry-button"
                  onClick={() => void send(true)}
                >
                  ↻ REINTENTAR ÚLTIMA TRANSMISIÓN
                </button>
              )}
              <NovaCompanion
                activity={activity}
                cue={cue}
                sound={sound}
                design={design}
                solo={solo}
                compact={messages.length > 0}
                onToggleMode={toggleSolo}
                onCollection={() => openAppearance("nova")}
              />
            </div>
          </Conversation>
        </section>
        <Chronoscope
          date={date}
          live={!chosenDate}
          onDate={chooseDate}
          natal={natal}
          transits={sky?.transits || []}
          aspects={sky?.aspects || []}
          engine={sky?.engine}
          skyError={skyError}
          houseCusps={natalProfile?.cusps || undefined}
          forecast={forecast}
          loading={forecastBusy}
          error={forecastError}
          onForecast={(days, planets) => void explore(days, planets)}
          onAspect={askAspect}
          onEvent={askEvent}
          onHover={(label) =>
            tellNova(`${label} en el radar. Tocá el contacto para explorarlo.`)
          }
        />
      </main>
      <footer className="console-bottom">
        <span>AP—09 / PERSONAL ORBIT SYSTEM</span>
        <span>
          {connection?.configured ? "ANTHROPIC CONFIGURADO" : "IA SIN CONECTAR"}{" "}
          · CÁLCULOS LOCALES
        </span>
        <a href="https://github.com/pat031-prog/astropocket" target="_blank" rel="noreferrer">CÓDIGO / AGPL ↗</a>
      </footer>
      {(notice || storageError) && (
        <div className="console-toast" role="status">
          {notice ||
            "El navegador no pudo guardar la sesión. Podés exportarla desde ↓ TXT."}
        </div>
      )}
    </div>
  );
}
