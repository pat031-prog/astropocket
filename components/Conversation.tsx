import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from "../types";
import useVoiceReader from "./useVoiceReader";

interface Props {
  messages: ChatMessage[];
  input: string;
  onInput: (text: string) => void;
  onSend: () => void;
  busy: boolean;
  onCancel: () => void;
  onFocus: (focused: boolean) => void;
  onSuggest: (text: string) => void;
  stage: string;
  children: React.ReactNode;
  onVoiceActivity: (speaking:boolean)=>void;
  example?: boolean;
}
export default function Conversation({
  messages,
  input,
  onInput,
  onSend,
  busy,
  onCancel,
  onFocus,
  onSuggest,
  stage,
  children,
  onVoiceActivity,
  example = false,
}: Props) {
  const log = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [below, setBelow] = useState(false);
  const voice=useVoiceReader();
  useEffect(()=>{onVoiceActivity(voice.playback?.state==="playing");},[voice.playback?.state,onVoiceActivity]);
  const lastUser = messages
    .filter((message) => message.role === "user")
    .at(-1)?.id;
  const checkPosition = () => {
    const area = log.current;
    if (area)
      setBelow(area.scrollHeight - area.scrollTop - area.clientHeight > 70);
  };
  // A new turn starts at the question. Streaming never drags the reader down.
  useLayoutEffect(() => {
    if (!log.current || !history.current) return;
    const user = Array.from(
      history.current.querySelectorAll<HTMLElement>(".transmission.user"),
    ).at(-1);
    log.current.scrollTop = user
      ? user.offsetTop - history.current.offsetTop
      : 0;
    checkPosition();
  }, [lastUser]);
  useLayoutEffect(() => {
    const field = textarea.current;
    if (!field) return;
    field.style.height = "0px";
    field.style.height = `${Math.min(144, Math.max(44, field.scrollHeight))}px`;
  }, [input]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (log.current)
        log.current.style.setProperty(
          "--reading-height",
          `${log.current.clientHeight}px`,
        );
      checkPosition();
    });
    if (log.current) observer.observe(log.current);
    if (history.current) observer.observe(history.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="log-frame" data-voice={!!voice.playback}>
        <div
          className="transmission-log"
          ref={log}
          role="log"
          aria-label="Conversación con Nova"
          aria-busy={busy}
          onScroll={checkPosition}
        >
          <div className="conversation-history" ref={history}>
            {messages.length === 0 ? (
              <div className="terminal-welcome">
                <span className="welcome-kanji" aria-hidden="true">
                  星間
                </span>
                <div className="boot-lines">
                  <p>
                    <span>01</span> {example ? "CARTA DE EJEMPLO" : "CARTA NATAL CARGADA"} <b>OK</b>
                  </p>
                  <p>
                    <span>02</span> EFEMÉRIDES DISPONIBLES <b>OK</b>
                  </p>
                  <p>
                    <span>03</span> UNIT-09 ESCUCHANDO
                    <span className="cursor-block" />
                  </p>
                </div>
                <h1>
                  Hay algo moviéndose
                  <br />
                  ahí arriba.
                </h1>
                <p className="welcome-caption">
                  {example ? "Cargá tu nacimiento en Carta para una lectura personal. Mientras tanto, podemos explorar el cielo con un mapa de ejemplo." : <>Podemos mirar el cielo de hoy, explorar una fecha
                  <br className="wide-only" /> o simplemente charlar de lo que
                  te está pasando.</>}
                </p>
                <div className="starter-commands">
                  {[
                    "¿Qué tránsitos están activos hoy?",
                    "Exploremos los próximos 30 días",
                    "Quiero entender mi carta natal",
                  ].map((text, index) => (
                    <button
                      key={text}
                      onClick={() => {
                        onSuggest(text);
                        textarea.current?.focus();
                      }}
                    >
                      <span>0{index + 1}</span>
                      {text}
                      <b>↗</b>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  className={`transmission ${message.role} ${message.error ? "failed" : ""}`}
                  key={message.id}
                >
                  <header>
                    <span>
                      {message.role === "user"
                        ? "► PILOT INPUT"
                        : "✳ NOVA / UNIT-09"}
                    </span>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {new Date(message.timestamp).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </header>
                  <div className="message-markdown">
                    <Markdown
                    remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content ||
                        (busy ? "▍" : "Transmisión sin contenido.")}
                    </Markdown>
                  </div>
                  {message.role === "model" && message.content && !message.inProgress && !message.error && (
                    <button type="button" className="listen-reading" disabled={!voice.supported} onClick={()=>void voice.read(message.id,message.content)} aria-label="Escuchar esta lectura" title={voice.supported?"Voz neuronal en español":"La voz no está disponible en este navegador"}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      {voice.playback?.id===message.id&&voice.playback.state!=="error"?"Volver a escuchar":"Escuchar lectura"}
                    </button>
                  )}
                  {message.role === "model" && message.content && (
                    <details className="reading-provenance">
                      <summary>
                        Datos de esta lectura <span>＋</span>
                      </summary>
                      <footer>
                        {message.natalSource && (
                          <span>Carta natal: {message.natalSource}</span>
                        )}
                        {message.engine && (
                          <span>{message.engine} · efemérides locales</span>
                        )}
                        <span>{message.mode || "MODERN"} / TROPICAL</span>
                        {message.contextDate && (
                          <span>
                            ◎{" "}
                            {new Date(message.contextDate).toLocaleDateString(
                              "es-AR",
                              { timeZone: "Etc/GMT+3" },
                            )}
                          </span>
                        )}
                        {message.contextRange && (
                          <span>
                            ◷{" "}
                            {new Date(
                              message.contextRange.from,
                            ).toLocaleDateString("es-AR", {
                              timeZone: "Etc/GMT+3",
                            })}{" "}
                            →{" "}
                            {new Date(
                              message.contextRange.to,
                            ).toLocaleDateString("es-AR", {
                              timeZone: "Etc/GMT+3",
                            })}
                          </span>
                        )}
                        {!!message.tools?.length && (
                          <span>
                            {message.tools.length} CONSULTA
                            {message.tools.length === 1 ? "" : "S"} AL MOTOR
                          </span>
                        )}
                      </footer>
                      {message.engine?.startsWith("Swiss Ephemeris") && (
                        <div className="reading-links">
                          <a
                            href="https://horoscopes.astro-seek.com/jpl-de431-ephemeris-astrology-online-tables"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tablas de Astro-Seek ↗
                          </a>
                          <a
                            href="https://horoscopes.astro-seek.com/transit-aspects-astrology-free-interpretations"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Guías de tránsitos ↗
                          </a>
                        </div>
                      )}
                    </details>
                  )}
                </article>
              ))
            )}
            {busy && (
              <div className="computation-line" role="status">
                <span className="activity-dots">▪ ▪ ▪</span>
                {stage || "NOVA ESTÁ CONECTANDO LOS PUNTOS"}
              </div>
            )}
          </div>
        </div>
        {below && messages.length > 0 && (
          <button
            className="jump-to-latest"
            onClick={() =>
              log.current?.scrollTo({
                top: log.current.scrollHeight,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            {busy ? "Seguir la lectura" : "Ir al final"} <span>↓</span>
          </button>
        )}
        {voice.playback && <div className="voice-player" role="region" aria-label="Reproductor de lectura">
          <div className="voice-caption"><span>{voice.playback.state==="error"?"Voz no disponible":voice.playback.state==="starting"?voice.playback.label||"Preparando voz natural…":voice.playback.state==="paused"?"Lectura en pausa":"Nova en voz"}</span><small>Voz neuronal · español</small></div>
          {voice.playback.state!=="error"&&<button type="button" disabled={voice.playback.state==="starting"} onClick={voice.toggle} aria-label={voice.playback.state==="paused"?"Reanudar lectura":"Pausar lectura"}>{voice.playback.state==="paused"?"▶":"Ⅱ"}</button>}
          <button type="button" onClick={voice.stop} aria-label="Detener lectura de voz">■</button>
          {voice.playback.error?<p role="alert">{voice.playback.error}</p>:<div className="voice-progress" role="progressbar" aria-label="Progreso de lectura" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(voice.playback.progress*100)}><span style={{width:`${voice.playback.progress*100}%`}}/></div>}
        </div>}
      </div>
      {children}
      <form
        className="terminal-composer"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <label className="sr-only" htmlFor="pilot-input">
          Mensaje para Nova
        </label>
        <div className="composer-field">
          <span className="prompt-marker">&gt;_</span>
          <textarea
            id="pilot-input"
            ref={textarea}
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onFocus={() => onFocus(true)}
            onBlur={() => onFocus(false)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing &&
                !busy
              ) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder="¿Qué querés mirar hoy?"
            rows={2}
            maxLength={8000}
          />
        </div>
        {busy ? (
          <button
            className="transmit-button stop"
            type="button"
            onClick={onCancel}
          >
            DETENER<span>■</span>
          </button>
        ) : (
          <button
            className="transmit-button"
            type="submit"
            disabled={!input.trim()}
          >
            ENVIAR<span>↵</span>
          </button>
        )}
        <div className="composer-foot">
          <span>ENTER · ENVIAR / SHIFT+ENTER · NUEVA LÍNEA</span>
          <span>LAS ESTRELLAS INCLINAN. VOS DECIDÍS.</span>
        </div>
      </form>
    </>
  );
}
