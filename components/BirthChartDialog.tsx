import React, { useEffect, useState } from "react";
import type { BirthPlace, NatalChart, NatalProfile } from "../types";

export default function BirthChartDialog({
  dialog,
  profile,
  onCalculated,
}: {
  dialog: React.RefObject<HTMLDialogElement>;
  profile?: NatalProfile | null;
  onCalculated: (natal: NatalChart, profile: NatalProfile) => void;
}) {
  const [date, setDate] = useState(profile?.birth.date || "");
  const [time, setTime] = useState(profile?.birth.time || "");
  const [known, setKnown] = useState(profile?.birth.timeKnown ?? true);
  const [query, setQuery] = useState(profile?.birth.place.name || "");
  const [place, setPlace] = useState<BirthPlace | null>(
    profile?.birth.place || null,
  );
  const [places, setPlaces] = useState<BirthPlace[]>([]);
  const [zone, setZone] = useState(profile?.birth.timeZone || "");
  const [system, setSystem] = useState<"P" | "W" | "E">(
    profile?.birth.houseSystem || "P",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState(false);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  useEffect(() => {
    if (manual || query.length < 2 || query === place?.name) {
      setPlaces([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void fetch("/api/places?q=" + encodeURIComponent(query), {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error();
          return response.json();
        })
        .then(setPlaces)
        .catch(() => {
          if (!controller.signal.aborted)
            setError("No se pudo buscar la ciudad en la base local.");
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, place?.name, manual]);
  const countryName = (country: string) => {
    try {
      return new Intl.DisplayNames(["es"], { type: "region" }).of(country);
    } catch {
      return country;
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget as HTMLFormElement);
    const submittedDate = String(fields.get("birthDate") || date);
    const submittedTime = String(fields.get("birthTime") || time || "12:00");
    setDate(submittedDate);
    setTime(submittedTime);
    if (!place || !zone) {
      setError(
        "Seleccioná una ciudad de la lista o ingresá sus coordenadas en Ajustes.",
      );
      return;
    }
    const finalPlace = manual
      ? {
          ...place,
          latitude: Number(fields.get("birthLat")),
          longitude: Number(fields.get("birthLon")),
        }
      : place;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: submittedDate,
          time: submittedTime,
          timeKnown: known,
          place: finalPlace,
          timeZone: zone,
          houseSystem: system,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No se pudo calcular la carta.");
      onCalculated(result.natal, result.profile);
      dialog.current?.close();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo calcular la carta.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <dialog ref={dialog} className="console-dialog birth-dialog">
      <form onSubmit={submit}>
        <div className="module-heading">
          <span>TU MAPA DE ORIGEN</span>
          <button
            type="button"
            aria-label="Cerrar datos de nacimiento"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <div className="dialog-content">
          <h2>El cielo cuando llegaste.</h2>
          <p>
            Calculamos los planetas, el Ascendente y las casas con tu fecha,
            hora y lugar. Los datos quedan en esta PC.
          </p>
          <div className="birth-row">
            <label>
              FECHA DE NACIMIENTO
              <input
                aria-label="Fecha de nacimiento"
                name="birthDate"
                type="date"
                min="1900-01-01"
                max="2100-12-31"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label>
              HORA LOCAL
              <input
                aria-label="Hora de nacimiento"
                name="birthTime"
                type="time"
                required={known}
                disabled={!known}
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </label>
          </div>
          <label className="unknown-time">
            <input
              type="checkbox"
              checked={!known}
              onChange={(event) => setKnown(!event.target.checked)}
            />
            No conozco mi hora exacta
          </label>
          {!known && (
            <p className="birth-caution">
              Sin hora usamos las 12:00 como referencia para los planetas. La
              carta no incluirá Ascendente ni casas.
            </p>
          )}
          <label htmlFor="birth-city">CIUDAD DE NACIMIENTO</label>
          <div className="place-search">
            <input
              id="birth-city"
              role="combobox"
              aria-expanded={places.length > 0}
              aria-controls="birth-places"
              aria-autocomplete="list"
              value={query}
              autoComplete="off"
              placeholder="Escribí una ciudad…"
              onChange={(event) => {
                setQuery(event.target.value);
                setPlace(
                  manual && place
                    ? { ...place, name: event.target.value }
                    : null,
                );
                setError("");
              }}
            />
            {places.length > 0 && (
              <div
                className="place-results"
                id="birth-places"
                role="listbox"
                aria-label="Ciudades encontradas"
              >
                {places.map((value) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    key={value.id}
                    onClick={() => {
                      setPlace(value);
                      setQuery(value.name);
                      setZone(value.zone);
                      setPlaces([]);
                    }}
                  >
                    <strong>{value.name}</strong>
                    <span>
                      {countryName(value.country)} · {value.zone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {place && (
            <p className="place-chosen">
              ✓ {place.name} · {countryName(place.country)}
              <small>
                {zone} · {place.latitude.toFixed(4)}°,{" "}
                {place.longitude.toFixed(4)}°
              </small>
            </p>
          )}
          <label className="house-system">
            SISTEMA DE CASAS
            <select
              value={system}
              onChange={(event) =>
                setSystem(event.target.value as "P" | "W" | "E")
              }
            >
              <option value="P">Placidus</option>
              <option value="W">Signos enteros</option>
              <option value="E">Casas iguales</option>
            </select>
          </label>
          <details className="birth-advanced">
            <summary>Ajustes de hora y ubicación</summary>
            <label>
              ZONA HORARIA O DESFASE UTC
              <input
                aria-label="Zona horaria del nacimiento"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                placeholder="America/Argentina/Buenos_Aires"
              />
            </label>
            <label className="unknown-time">
              <input
                type="checkbox"
                checked={manual}
                onChange={(event) => {
                  setManual(event.target.checked);
                  if (event.target.checked) {
                    setManualLatitude(place ? String(place.latitude) : "");
                    setManualLongitude(place ? String(place.longitude) : "");
                    setPlaces([]);
                    setPlace({
                      id: "manual",
                      name: query || "Lugar manual",
                      country: "",
                      latitude: place?.latitude ?? 0,
                      longitude: place?.longitude ?? 0,
                      zone: zone || "UTC",
                    });
                  }
                }}
              />
              Ingresar coordenadas manualmente
            </label>
            {manual && place && (
              <div className="birth-row">
                <label>
                  LATITUD
                  <input
                    aria-label="Latitud de nacimiento"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    required
                    name="birthLat"
                    value={manualLatitude}
                    onChange={(event) => {
                      setManualLatitude(event.target.value);
                      setPlace({
                        ...place,
                        latitude: Number(event.target.value),
                      });
                    }}
                  />
                </label>
                <label>
                  LONGITUD
                  <input
                    aria-label="Longitud de nacimiento"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    required
                    name="birthLon"
                    value={manualLongitude}
                    onChange={(event) => {
                      setManualLongitude(event.target.value);
                      setPlace({
                        ...place,
                        longitude: Number(event.target.value),
                      });
                    }}
                  />
                </label>
              </div>
            )}
            <p>
              La zona de la ciudad aplica sus cambios históricos. Si la hora
              coincide con un cambio de horario, podés indicar un desfase como
              −03:00.
            </p>
          </details>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            {busy ? "CALCULANDO TU CARTA…" : "CALCULAR Y USAR ESTA CARTA →"}
          </button>
          <p className="birth-privacy">
            La conversación con Nova usa las posiciones y casas calculadas. La
            ciudad y la hora de nacimiento se guardan localmente.
          </p>
          <div className="birth-sources">
            Swiss Ephemeris · ciudades de{" "}
            <a
              href="https://www.geonames.org/"
              target="_blank"
              rel="noreferrer"
            >
              GeoNames ↗
            </a>
          </div>
        </div>
      </form>
    </dialog>
  );
}
