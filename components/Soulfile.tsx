import React, { useEffect, useRef, useState } from "react";
import type { NatalChart, NatalProfile } from "../types";
import { PLANET_GLYPHS } from "../constants";
import { formatDegree, planetName, SIGNS } from "../services/astroDisplay";
import AstroWheel from "./AstroWheel";
import BirthChartDialog from "./BirthChartDialog";
import { makeBirthLink, readBirthLink } from "../services/birthLink";

export default function Soulfile({
  natal,
  name,
  onSave,
  onChoose,
  profile,
  example = false,
}: {
  natal: NatalChart;
  name: string;
  onSave: (name: string, natal: NatalChart, profile?: NatalProfile) => void;
  onChoose: (text: string) => void;
  profile?: NatalProfile | null;
  example?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const birthDialog = useRef<HTMLDialogElement>(null);
  const chartDialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<"wheel" | "positions">("wheel");
  const [draft, setDraft] = useState(natal);
  const [draftName, setDraftName] = useState(name);
  const [imported] = useState(() => {
    try { return { birth: readBirthLink(window.location.hash), error: "" }; }
    catch (error) { return { birth: null, error: error instanceof Error ? error.message : "Enlace inválido." }; }
  });
  const [importDone, setImportDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const personalLink = profile ? makeBirthLink(window.location.href, profile.birth) : "";
  useEffect(() => {
    if (imported.birth) birthDialog.current?.showModal();
  }, [imported]);
  return (
    <><aside className="console-panel soul-panel">
      <div className="module-heading">
        <span>01 / SOULFILE</span>
        <span>◈ NATAL</span>
      </div>
      <div className="pilot-identity">
        <span className="pilot-code">PILOT DATA / PERSONAL ARCHIVE</span>
        <h2>{name}</h2>
        <span className={`chart-source ${profile ? "verified" : ""}`}>
          {example ? "◌ CARTA DE EJEMPLO" : profile
            ? "● CALCULADA CON SWISS EPHEMERIS"
            : "◌ CARTA HEREDADA / POR VERIFICAR"}
        </span>
        <button
          className="birth-open"
          onClick={() => birthDialog.current?.showModal()}
        >
          {profile ? "DATOS DE NACIMIENTO" : "CALCULAR MI CARTA"}{" "}
          <span>↗</span>
        </button>
        <button
          onClick={() => {
            setDraft(structuredClone(natal));
            setDraftName(name);
            dialog.current?.showModal();
          }}
        >
          EDITAR COORDENADAS <span>↗</span>
        </button>
      </div>
      <div className="instrument-tabs">
        <button
          className={view === "wheel" ? "selected" : ""}
          aria-pressed={view === "wheel"}
          onClick={() => setView("wheel")}
        >
          CARTA
        </button>
        <button
          className={view === "positions" ? "selected" : ""}
          aria-pressed={view === "positions"}
          onClick={() => setView("positions")}
        >
          POSICIONES
        </button>
        <button
          aria-label="Ampliar carta natal"
          onClick={() => chartDialog.current?.showModal()}
        >
          AMPLIAR ↗
        </button>
      </div>
      {view === "wheel" && (
        <div className="natal-wheel">
          <AstroWheel
            natal
            natalChart={natal}
            houseCusps={profile?.cusps || undefined}
          />
        </div>
      )}
      <div className="natal-triad">
        {["Sol", "Luna", "Asc"].map(
          (key) =>
            natal[key] && (
              <button
                key={key}
                onClick={() =>
                  onChoose(
                    `Hablemos de mi ${planetName(key)} en ${natal[key].sign} a ${formatDegree(natal[key].deg)}.`,
                  )
                }
              >
                <span>{PLANET_GLYPHS[key] + "\uFE0E"}</span>
                <small>{key.toUpperCase()}</small>
                <strong>{natal[key].sign}</strong>
              </button>
            ),
        )}
      </div>
      <div className={`list-heading ${view === "wheel" ? "chart-hidden" : ""}`}>
        <span>POSICIONES GUARDADAS</span>
        <span>↓</span>
      </div>
      <div
        className={`instrument-scroll natal-positions ${view === "wheel" ? "chart-hidden" : ""}`}
      >
        {Object.entries(natal).map(([key, value]) => (
          <button
            className="astro-row"
            key={key}
            onClick={() =>
              onChoose(
                `¿Cómo se expresa mi ${planetName(key)} en ${value.sign} a ${formatDegree(value.deg)}?`,
              )
            }
          >
            <span className="planet-code">
              {(PLANET_GLYPHS[key] || "◈") + "\uFE0E"}
            </span>
            <span>
              <strong>{planetName(key)}</strong>
              <small>{value.sign}</small>
            </span>
            <span className="numeric">
              {formatDegree(value.deg)}
              {value.retrograde ? " ℞" : ""}
              {value.house && <small> CASA {value.house}</small>}
            </span>
          </button>
        ))}
      </div>
      <div className="soul-note">
        {imported.error && <p role="alert">{imported.error}</p>}
        <span>
          {example ? "EJEMPLO / 01.01.2000 / BUENOS AIRES" : profile ? "MAPA CALCULADO / TROPICAL" : "ARCHIVO DE ORIGEN / V9.6"}
        </span>
        <p>
          {example ? "Este mapa es una muestra. Cargá tu nacimiento para que los tránsitos y las lecturas se refieran a tu carta." : profile
            ? `${profile.birth.place.name} · ${profile.birth.date} · ${profile.birth.timeKnown ? profile.birth.time : "hora desconocida"} · ${profile.birth.timeZone}. ${profile.warning || "Casas " + { P: "Placidus", W: "por signos enteros", E: "iguales" }[profile.birth.houseSystem] + "."} Nodo ${profile.birth.nodeType === "mean" ? "medio" : "verdadero"}.`
            : "Estas posiciones venían del proyecto original. Calculá tu carta con nacimiento o verificá los grados con Astro-Seek."}
        </p>
        <a
          href="https://horoscopes.astro-seek.com/birth-chart-horoscope-online"
          target="_blank"
          rel="noreferrer"
        >
          ABRIR ASTRO-SEEK ↗
        </a>
        {profile && <details className="chart-transfer">
          <summary>Llevar mi carta a otro dispositivo ↗</summary>
          <p>Este enlace contiene tu fecha, hora y lugar. Abrilo en tu celular para cargar la misma carta. No incluye tu clave ni tus conversaciones.</p>
          <input aria-label="Enlace personal de mi carta" readOnly value={personalLink} onFocus={event => event.target.select()} />
          <button onClick={async () => {
            try { await navigator.clipboard.writeText(personalLink); setCopied(true); }
            catch { setCopied(false); }
          }}>{copied ? "✓ Enlace copiado" : "Copiar enlace de mi carta"}</button>
        </details>}
      </div>
      <div className="module-foot">
        <span>ZODÍACO TROPICAL</span>
        <span>SOULFILE / LOCAL</span>
      </div>
      <dialog ref={dialog} className="console-dialog">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(
              draftName.trim() || "Piloto",
              Object.fromEntries(
                Object.entries(draft).map(([key, value]) => [
                  key,
                  { sign: value.sign, deg: value.deg },
                ]),
              ),
            );
            dialog.current?.close();
          }}
        >
          <div className="module-heading">
            <span>EDITAR SOULFILE</span>
            <button
              type="button"
              aria-label="Cerrar carta natal"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </div>
          <div className="dialog-content">
            <p>
              Ingresá posiciones tropicales verificadas. El ascendente se
              conserva como dato: no lo deducimos del signo solar.
            </p>
            <label>
              NOMBRE DEL PILOTO
              <input
                value={draftName}
                maxLength={100}
                onChange={(event) => setDraftName(event.target.value)}
                required
              />
            </label>
            <div className="coordinate-editor">
              {Object.entries(draft).map(([key, value]) => (
                <label key={key}>
                  <span>{planetName(key)}</span>
                  <select
                    aria-label={`Signo de ${planetName(key)}`}
                    value={value.sign}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [key]: { ...value, sign: event.target.value },
                      })
                    }
                  >
                    {SIGNS.map((sign) => (
                      <option key={sign}>{sign}</option>
                    ))}
                  </select>
                  <input
                    aria-label={`Grados de ${planetName(key)}`}
                    type="number"
                    min="0"
                    max="29.9999"
                    step="0.0001"
                    required
                    value={value.deg}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [key]: { ...value, deg: Number(event.target.value) },
                      })
                    }
                  />
                  <span>°</span>
                </label>
              ))}
            </div>
            <p className="instrument-note">
              Estos datos y el historial se guardan en este navegador. Al
              conversar, se envían la carta y los mensajes a Anthropic.
            </p>
            <button className="primary-button" type="submit">
              GUARDAR COORDENADAS →
            </button>
          </div>
        </form>
      </dialog>
      <dialog ref={chartDialog} className="console-dialog chart-dialog">
        <div className="module-heading">
          <span>LA CARTA DE {name.toUpperCase()}</span>
          <button
            aria-label="Cerrar carta ampliada"
            onClick={() => chartDialog.current?.close()}
          >
            ×
          </button>
        </div>
        <div className="chart-large">
          <AstroWheel
            natal
            natalChart={natal}
            houseCusps={profile?.cusps || undefined}
          />
        </div>
        <div className="chart-key">
          {Object.entries(natal).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                chartDialog.current?.close();
                onChoose(
                  `Hablemos de mi ${planetName(key)} en ${value.sign} a ${formatDegree(value.deg)}${value.house ? ", casa " + value.house : ""}.`,
                );
              }}
            >
              <span>{PLANET_GLYPHS[key] || key}</span>
              <strong>{planetName(key)}</strong>
              <small>
                {value.sign} {formatDegree(value.deg)}
              </small>
            </button>
          ))}
        </div>
      </dialog>
    </aside>
      <BirthChartDialog
        dialog={birthDialog}
        profile={profile}
        initialBirth={!importDone ? imported.birth : null}
        onCalculated={(chart, nextProfile) => {
          onSave(name, chart, nextProfile);
          setImportDone(true);
          if (window.location.hash.startsWith("#carta=")) history.replaceState(history.state, "", window.location.pathname + window.location.search);
        }}
      />
    </>
  );
}
