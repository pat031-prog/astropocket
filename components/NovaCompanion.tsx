import React, { useEffect, useRef, useState } from "react";
import NovaShell, { NOVAS, type NovaDesign } from "./NovaShell";

export type NovaActivity =
  | "idle"
  | "listening"
  | "scanning"
  | "speaking"
  | "success"
  | "warning";
export interface NovaCue {
  id: number;
  text: string;
  mood?: NovaActivity;
}
export default function NovaCompanion({
  activity,
  cue,
  sound,
  design = "classic",
  solo = false,
  compact = false,
  onToggleMode,
  onCollection,
}: {
  activity: NovaActivity;
  cue: NovaCue;
  sound: boolean;
  design?: NovaDesign;
  solo?: boolean;
  compact?: boolean;
  onToggleMode?: () => void;
  onCollection?: () => void;
}) {
  const [gesture, setGesture] = useState("");
  const [asleep, setAsleep] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const robot = useRef<HTMLButtonElement>(null);
  const gaze = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    px: number;
    py: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const lastTouch = useRef(Date.now());
  const audio = useRef<AudioContext | null>(null);
  const gestureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nova = NOVAS.find((item) => item.id === design) || NOVAS[0];
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [compact, solo, design]);
  const wake = () => {
    lastTouch.current = Date.now();
    setAsleep(false);
  };
  const tone = () => {
    if (!sound) return;
    try {
      const ctx = (audio.current ??= new AudioContext());
      void ctx.resume();
      [440, 660, 880].forEach((hz, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = hz;
        gain.gain.setValueAtTime(0.025, ctx.currentTime + index * 0.07);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + index * 0.07 + 0.12,
        );
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(ctx.currentTime + index * 0.07);
        oscillator.stop(ctx.currentTime + index * 0.07 + 0.13);
      });
    } catch {
      /* Audio is optional. */
    }
  };
  const react = (value: string) => {
    wake();
    setGesture(value);
    if (gestureTimer.current) clearTimeout(gestureTimer.current);
    gestureTimer.current = setTimeout(() => setGesture(""), 1600);
  };
  useEffect(() => {
    wake();
  }, [activity, cue.id]);
  useEffect(() => {
    let frame = 0;
    const look = (event: PointerEvent) => {
      if (frame) return;
      const x = event.clientX,
        y = event.clientY;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!robot.current || !gaze.current) return;
        const box = robot.current.getBoundingClientRect();
        gaze.current.style.setProperty(
          "--gaze-x",
          `${Math.max(-5, Math.min(5, (x - box.left - box.width / 2) / 65))}px`,
        );
        gaze.current.style.setProperty(
          "--gaze-y",
          `${Math.max(-3, Math.min(3, (y - box.top - box.height / 2) / 100))}px`,
        );
      });
    };
    document.addEventListener("pointermove", look, { passive: true });
    const idle = setInterval(() => {
      if (
        activity === "idle" &&
        Date.now() - lastTouch.current > 35000 &&
        !drag.current
      )
        setAsleep(true);
    }, 3000);
    return () => {
      document.removeEventListener("pointermove", look);
      cancelAnimationFrame(frame);
      clearInterval(idle);
    };
  }, [activity]);
  useEffect(
    () => () => {
      if (gestureTimer.current) clearTimeout(gestureTimer.current);
      void audio.current?.close();
    },
    [],
  );
  const mood = dragging
    ? "dragging"
    : gesture || (asleep && activity === "idle" ? "sleeping" : activity);
  const phrase =
    mood === "sleeping"
      ? "Guardia nocturna… zzz"
      : mood === "happy"
        ? "¡Eh! Esas son mis antenas."
        : dragging
          ? "Transporte manual activado."
          : mood === "listening"
            ? "Te escucho. Tomate tu tiempo."
            : mood === "scanning"
              ? "Un segundo. Estoy mirando ahí arriba."
              : mood === "speaking"
                ? "Encontré algo para contarte."
                : cue.text;
  return (
    <div className={`nova-bay variant-${design} mood-${mood}`}>
      <div className="nova-station">
        <span className="station-ring" />
        <button
          ref={robot}
          type="button"
          className="nova-robot"
          aria-label="Nova, tu compañero. Tocar para saludar; arrastrar para mover."
          title="Doble clic: modo Nova"
          onDoubleClick={onToggleMode}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(${dragging ? Math.max(-12, Math.min(12, position.x / 8)) : 0}deg)`,
          }}
          onPointerDown={(event) => {
            wake();
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              px: position.x,
              py: position.y,
              moved: false,
            };
            robot.current?.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            const dx = event.clientX - drag.current.x,
              dy = event.clientY - drag.current.y;
            if (Math.hypot(dx, dy) > 5) {
              drag.current.moved = true;
              setDragging(true);
            }
            if (drag.current.moved) {
              const bay = robot.current
                ?.closest(".nova-bay")
                ?.getBoundingClientRect();
              setPosition({
                x: Math.max(
                  -20,
                  Math.min((bay?.width || 350) - 110, drag.current.px + dx),
                ),
                y: Math.max(-60, Math.min(30, drag.current.py + dy)),
              });
            }
          }}
          onPointerUp={(event) => {
            if (!drag.current) return;
            suppressClick.current = drag.current.moved;
            if (drag.current.moved) react("recovering");
            drag.current = null;
            setDragging(false);
            robot.current?.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
          }}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            react("happy");
            tone();
          }}
        >
          <NovaShell face={gaze} design={design} />
        </button>
      </div>
      <div className="nova-dialogue">
        <span className="nova-id">
          {nova.name.toUpperCase()}{" "}
          <small>
            UNIT—{nova.number} / {mood === "sleeping" ? "STANDBY" : "ONLINE"}
          </small>
        </span>
        <div className="nova-actions">
          <button onClick={onCollection}>
            CAMBIAR NOVA <span>◈</span>
          </button>
          <button onClick={onToggleMode}>
            {solo ? "VOLVER A LA CONSOLA" : "SÓLO NOVA"}{" "}
            <span>{solo ? "↙" : "↗"}</span>
          </button>
        </div>
        <p>{phrase}</p>
        <span className="nova-hint">
          {position.x || position.y ? (
            <button
              onClick={() => {
                setPosition({ x: 0, y: 0 });
                react("happy");
              }}
            >
              ↩ Volver a la estación
            </button>
          ) : (
            "Podés tocarme. También moverme."
          )}
        </span>
      </div>
    </div>
  );
}
