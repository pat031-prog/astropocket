import React, { useEffect, useRef, useState } from "react";
import type {
  Aspect,
  TransitEvent,
  TransitPlanet,
  TransitSearch,
} from "../types";
import { PLANET_GLYPHS } from "../constants";
import {
  aspectGlyph,
  aspectName,
  formatDegree,
  planetName,
  signName,
} from "../services/astroDisplay";
import AstroWheel from "./AstroWheel";

const dateField = (date: string) =>
  new Date(Date.parse(date) - 3 * 3600000).toISOString().slice(0, 16);
const groups: Record<string, string[]> = {
  slow: ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"],
  personal: ["Sun", "Mercury", "Venus", "Mars"],
  moon: ["Moon"],
};
interface Props {
  date: string;
  live: boolean;
  onDate: (date: string | null) => void;
  transits: TransitPlanet[];
  aspects: Aspect[];
  natal: import("../types").NatalChart;
  forecast: TransitSearch | null;
  loading: boolean;
  error: string;
  onForecast: (days: number, planets: string[]) => void;
  onAspect: (aspect: Aspect) => void;
  onEvent: (event: TransitEvent) => void;
  onHover: (label: string) => void;
  engine?: { name: string; version: string; reference?: string };
  skyError?: string;
  houseCusps?: number[];
}
export default function Chronoscope(props: Props) {
  const [view, setView] = useState<"map" | "window" | "positions">("map");
  const [tight, setTight] = useState(false);
  const [days, setDays] = useState(30);
  const [planetSet, setPlanetSet] = useState("slow");
  const [draftDate, setDraftDate] = useState(dateField(props.date));
  const dateInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (document.activeElement !== dateInput.current)
      setDraftDate(dateField(props.date));
  }, [props.date]);
  useEffect(() => {
    if (!props.forecast) return;
    setView("window");
    const key = [...props.forecast.planets].sort().join(",");
    setPlanetSet(
      Object.keys(groups).find(
        (id) => [...groups[id]].sort().join(",") === key,
      ) || "custom",
    );
    setDays(
      Math.max(
        1,
        Math.round(
          (Date.parse(props.forecast.to) - Date.parse(props.forecast.from)) /
            86400000,
        ),
      ),
    );
  }, [props.forecast]);
  const searchPlanets =
    groups[planetSet] || props.forecast?.planets || groups.slow;
  const [dateError, setDateError] = useState("");
  const changeDate = (value: string) => {
    if (!value) return;
    const instant = new Date(
      (value.length === 16 ? value + ":00" : value) + "-03:00",
    );
    if (
      !Number.isFinite(instant.getTime()) ||
      instant.getUTCFullYear() < 1900 ||
      instant.getUTCFullYear() > 2100
    ) {
      setDateError("Elegí una fecha entre 1900 y 2100.");
      return;
    }
    setDateError("");
    props.onDate(instant.toISOString());
  };
  return (
    <aside className="console-panel sky-panel">
      {props.skyError && (
        <p className="inline-error" role="alert">
          {props.skyError}
        </p>
      )}
      <div className="module-heading">
        <span>02 / CHRONOSCOPE</span>
        <span className={props.live ? "live-signal" : "future-signal"}>
          {props.live ? "● LIVE" : "◷ EXPLORACIÓN"}
        </span>
      </div>
      <div className="chronometer">
        <label htmlFor="sky-date">
          COORDENADA TEMPORAL <span>ART / UTC−03</span>
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            changeDate(dateInput.current?.value || draftDate);
          }}
        >
          <button
            type="button"
            aria-label="Día anterior"
            onClick={() =>
              props.onDate(
                new Date(Date.parse(props.date) - 86400000).toISOString(),
              )
            }
          >
            ‹
          </button>
          <input
            id="sky-date"
            ref={dateInput}
            type="datetime-local"
            min="1900-01-01T00:00"
            max="2100-12-31T23:59"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
          />
          <button
            type="submit"
            className="jump-button"
            aria-label="Ir a la fecha seleccionada"
          >
            IR
          </button>
          <button
            type="button"
            aria-label="Día siguiente"
            onClick={() =>
              props.onDate(
                new Date(Date.parse(props.date) + 86400000).toISOString(),
              )
            }
          >
            ›
          </button>
          <button
            type="button"
            className="now-button"
            onClick={() => {
              setDateError("");
              props.onDate(null);
            }}
          >
            AHORA
          </button>
        </form>
        {dateError && (
          <p className="inline-error" role="alert">
            {dateError}
          </p>
        )}
      </div>
      <div className="instrument-tabs" aria-label="Vista del cronoscopio">
        {(
          [
            ["map", "MAPA"],
            ["window", "VENTANA"],
            ["positions", "POSICIONES"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            className={view === id ? "selected" : ""}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "map" ? (
        <>
          <div className="sky-wheel">
            <AstroWheel
              transits={props.transits}
              natalChart={props.natal}
              houseCusps={props.houseCusps}
              comparison
              aspects={props.aspects}
            />
            <div className="instrument-legend">
              <span>◌ TRÁNSITOS</span>
              <span>◉ NATAL</span>
            </div>
          </div>
          <div className="list-heading">
            <span>
              ASPECTOS A TU CARTA <b>{props.aspects.length}</b>
            </span>
            <label>
              <input
                type="checkbox"
                checked={tight}
                onChange={(event) => setTight(event.target.checked)}
              />
              ≤ 1°
            </label>
          </div>
          <div className="instrument-scroll aspect-list">
            {props.aspects
              .filter((aspect) => !tight || aspect.orb <= 1)
              .map((aspect) => (
                <button
                  className="astro-row"
                  key={`${aspect.transitingPlanet}-${aspect.natalPlanet}-${aspect.type}`}
                  onClick={() => props.onAspect(aspect)}
                  onPointerEnter={() =>
                    props.onHover(planetName(aspect.transitingPlanet))
                  }
                >
                  <span
                    className={`aspect-code ${aspect.nature.toLowerCase()}`}
                  >
                    {aspectGlyph(aspect.type)}
                  </span>
                  <span>
                    <strong>
                      {planetName(aspect.transitingPlanet)} ·{" "}
                      {planetName(aspect.natalPlanet)}
                    </strong>
                    <small>
                      {aspectName(aspect.type)} ·{" "}
                      {aspect.applying ? "aplicando" : "separando"}
                    </small>
                  </span>
                  <span className="numeric">{aspect.orb.toFixed(2)}°</span>
                </button>
              ))}
            {tight && !props.aspects.some((aspect) => aspect.orb <= 1) && (
              <p className="instrument-empty">
                Sin contactos de hasta 1°. Ampliá el filtro para ver los demás.
              </p>
            )}
          </div>
        </>
      ) : view === "positions" ? (
        <div className="instrument-scroll position-list">
          {props.transits.map((planet) => (
            <button
              key={planet.name}
              className="astro-row"
              onPointerEnter={() => props.onHover(planetName(planet.name))}
              onClick={() => {
                const aspect = props.aspects.find(
                  (value) => value.transitingPlanet === planet.name,
                );
                if (aspect) props.onAspect(aspect);
                else
                  props.onHover(
                    `${planetName(planet.name)} en ${signName(planet.sign)}`,
                  );
              }}
            >
              <span className="planet-code">
                {PLANET_GLYPHS[planet.name] + "\uFE0E"}
              </span>
              <span>
                <strong>{planetName(planet.name)}</strong>
                <small>
                  {signName(planet.sign)} {formatDegree(planet.signDegree)}
                </small>
              </span>
              <span
                className={planet.isRetrograde ? "retro-tag" : "direct-tag"}
              >
                {planet.isRetrograde ? "R" : "D"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="window-panel">
          <div className="window-controls">
            <label>
              INTERVALO
              <select
                aria-label="Duración de la ventana"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              >
                <option value={7}>7 días</option>
                <option value={30}>30 días</option>
                <option value={90}>90 días</option>
                <option value={365}>1 año</option>
                {![7, 30, 90, 365].includes(days) && (
                  <option value={days}>{days} días</option>
                )}
              </select>
            </label>
            <label>
              PLANETAS
              <select
                aria-label="Planetas del intervalo"
                value={planetSet}
                onChange={(event) => setPlanetSet(event.target.value)}
              >
                <option value="slow">Lentos · Júpiter a Plutón</option>
                <option value="personal">Sol, Mercurio, Venus, Marte</option>
                <option value="moon">Luna · hasta 30 días</option>
                {planetSet === "custom" && (
                  <option value="custom">Selección del resultado</option>
                )}
              </select>
            </label>
            <button
              className="scan-button"
              disabled={props.loading}
              onClick={() =>
                props.onForecast(
                  searchPlanets.includes("Moon") ? Math.min(days, 30) : days,
                  searchPlanets,
                )
              }
            >
              {props.loading ? "CALCULANDO…" : "EXPLORAR INTERVALO"}
              <span>→</span>
            </button>
          </div>
          {props.error && (
            <p className="inline-error" role="alert">
              {props.error}
            </p>
          )}
          {props.forecast ? (
            <>
              <div className="list-heading">
                <span>
                  {props.forecast.total}{" "}
                  {props.forecast.total === 1
                    ? "CONTACTO EXACTO"
                    : "CONTACTOS EXACTOS"}
                </span>
                <span>
                  {new Date(props.forecast.from).toLocaleDateString("es-AR", {
                    timeZone: "Etc/GMT+3",
                  })}{" "}
                  →{" "}
                  {new Date(props.forecast.to).toLocaleDateString("es-AR", {
                    timeZone: "Etc/GMT+3",
                  })}
                </span>
              </div>
              <p className="forecast-scope">
                {props.forecast.planets?.map(planetName).join(" · ")}
              </p>
              <div className="instrument-scroll event-list">
                {props.forecast.events.map((event) => (
                  <button
                    className="event-row"
                    key={event.id}
                    onClick={() => props.onEvent(event)}
                  >
                    <time dateTime={event.date}>
                      <b>
                        {new Date(event.date).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          timeZone: "Etc/GMT+3",
                        })}
                      </b>
                      <small>
                        {new Date(event.date).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "Etc/GMT+3",
                        })}{" "}
                        ART
                      </small>
                    </time>
                    <span>
                      <strong>
                        {planetName(event.transitingPlanet)}{" "}
                        {aspectGlyph(event.type)}{" "}
                        {planetName(event.natalPlanet)}
                      </strong>
                      <small>
                        {aspectName(event.type)}
                        {event.retrograde ? " · paso retrógrado" : ""}
                      </small>
                    </span>
                    <span>↗</span>
                  </button>
                ))}
                {!props.forecast.total && (
                  <p className="instrument-empty">
                    No se encontraron contactos exactos en este intervalo. Probá
                    ampliar la ventana o cambiar los planetas.
                  </p>
                )}
              </div>
              {props.forecast.truncated && (
                <p className="instrument-note">
                  Se muestran los primeros 100 contactos. Acotá el intervalo
                  para ver el resto.
                </p>
              )}
            </>
          ) : (
            <div className="window-empty">
              <span>◷</span>
              <h3>El cielo también tiene historia.</h3>
              <p>
                Buscá encuentros futuros o pasados a partir de la fecha
                seleccionada.
              </p>
            </div>
          )}
          <p className="instrument-note">
            Contacto exacto = geometría del aspecto. La lectura de lo que
            significa se conversa con Nova.
          </p>
        </div>
      )}
      <div className="module-foot">
        <span>
          {props.engine
            ? `${props.engine.name} ${props.engine.version}`
            : props.skyError
              ? "MOTOR NO DISPONIBLE"
              : "CARGANDO EFEMÉRIDES…"}
        </span>
        <span>TROPICAL / GEOCÉNTRICO</span>
      </div>
    </aside>
  );
}
