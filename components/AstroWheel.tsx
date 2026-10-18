import React, { useId } from "react";
import { NATAL_DATA, PLANET_GLYPHS, ZODIAC_GLYPHS } from "../constants";
import { Aspect, NatalChart, TransitPlanet } from "../types";
import { signIndex } from "../services/astroDisplay";

function point(angle: number, radius: number) {
  const radians = ((180 + angle) * Math.PI) / 180;
  return {
    x: 200 + Math.cos(radians) * radius,
    y: 200 - Math.sin(radians) * radius,
  };
}
export default function AstroWheel({
  transits = [],
  natal = false,
  comparison = false,
  aspects = [],
  natalChart = NATAL_DATA,
  houseCusps,
}: {
  transits?: TransitPlanet[];
  natal?: boolean;
  comparison?: boolean;
  aspects?: Aspect[];
  natalChart?: NatalChart;
  houseCusps?: number[];
}) {
  const id = useId();
  const asc = natalChart.Asc
    ? signIndex(natalChart.Asc.sign) * 30 + natalChart.Asc.deg
    : 0;
  const toPoint = (longitude: number, radius: number) =>
    point(longitude - asc, radius);
  const natalPoints = Object.entries(natalChart).map(([name, data]) => ({
    name,
    longitude: signIndex(data.sign) * 30 + data.deg,
  }));
  const planets = natal ? natalPoints : transits;
  const points: { name: string; longitude: number; x: number; y: number }[] =
    [];
  planets.forEach((planet) => {
    const candidate =
      [122, 100, 79, 57]
        .map((radius) => toPoint(planet.longitude, radius))
        .find((p) =>
          points.every(
            (other) => Math.hypot(p.x - other.x, p.y - other.y) > 21,
          ),
        ) || toPoint(planet.longitude, 122);
    points.push({ ...planet, ...candidate });
  });
  return (
    <svg
      className="astro-wheel"
      viewBox="0 0 400 400"
      role="img"
      aria-label={
        natal
          ? "Rueda de las posiciones de la carta natal guardada"
          : comparison
            ? "Rueda del cielo actual comparado con la carta natal"
            : "Rueda de las posiciones planetarias actuales"
      }
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="var(--purple)" stopOpacity=".09" />
          <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="195" fill={`url(#${id}-glow)`} />
      <g fill="none" stroke="var(--line)">
        <circle cx="200" cy="200" r="184" strokeOpacity=".5" />
        <circle cx="200" cy="200" r="166" />
        <circle cx="200" cy="200" r="141" />
        <circle cx="200" cy="200" r="80" strokeOpacity=".4" />
        <circle
          cx="200"
          cy="200"
          r="56"
          strokeDasharray="2 7"
          strokeOpacity=".5"
        />
      </g>
      {Array.from({ length: 120 }, (_, index) => {
        const a = toPoint(index * 3, 167);
        const b = toPoint(
          index * 3,
          index % 10 === 0 ? 182 : index % 5 === 0 ? 175 : 171,
        );
        return (
          <line
            key={index}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--muted)"
            strokeWidth={index % 10 === 0 ? 1 : 0.6}
            opacity={index % 10 === 0 ? 0.8 : 0.5}
          />
        );
      })}
      {ZODIAC_GLYPHS.map((glyph, index) => {
        const position = toPoint(index * 30 + 15, 153);
        const start = toPoint(index * 30, 141);
        const end = toPoint(index * 30, 166);
        return (
          <g key={glyph}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="var(--line)"
            />
            <text
              x={position.x}
              y={position.y + 5}
              textAnchor="middle"
              fill={index % 3 === 0 ? "var(--purple)" : "var(--muted)"}
              fontSize="15"
            >
              {glyph + "\uFE0E"}
            </text>
          </g>
        );
      })}
      {houseCusps?.length === 12 &&
        houseCusps.map((longitude, index) => {
          const start = toPoint(longitude, 72),
            end = toPoint(longitude, 141);
          const next = houseCusps[(index + 1) % 12];
          const middle = longitude + ((next - longitude + 360) % 360) / 2;
          const label = toPoint(middle, 134);
          return (
            <g key={`house-${index}`}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={index % 3 === 0 ? "var(--purple)" : "var(--line)"}
                strokeWidth={index % 3 === 0 ? "1.1" : ".6"}
                opacity=".65"
              />
              <text
                x={label.x}
                y={label.y + 3}
                fontSize="8"
                textAnchor="middle"
                fill="var(--muted)"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
      {natalChart.Asc && (
        <text x="7" y="196" fontSize="8" fill="var(--purple)">
          ASC
        </text>
      )}
      {!comparison &&
        points.flatMap((first, i) =>
          points.slice(i + 1).map((second) => {
            const distance = Math.abs(
              ((second.longitude - first.longitude + 540) % 360) - 180,
            );
            const soft =
              Math.abs(distance - 120) < 4 || Math.abs(distance - 60) < 3;
            const hard =
              Math.abs(distance - 90) < 4 || Math.abs(distance - 180) < 4;
            return soft || hard ? (
              <line
                key={`${first.name}-${second.name}`}
                x1={first.x}
                y1={first.y}
                x2={second.x}
                y2={second.y}
                stroke={soft ? "var(--cyan)" : "var(--pink)"}
                strokeWidth=".75"
                opacity=".42"
              />
            ) : null;
          }),
        )}
      {comparison &&
        aspects
          .filter((aspect) => aspect.orb <= 3)
          .map((aspect) => {
            const outer = points.find(
              (planet) => planet.name === aspect.transitingPlanet,
            );
            const natalPoint = natalPoints.find(
              (planet) => planet.name === aspect.natalPlanet,
            );
            if (!outer || !natalPoint) return null;
            const inner = toPoint(natalPoint.longitude, 68);
            return (
              <line
                key={`${aspect.transitingPlanet}-${aspect.natalPlanet}-${aspect.type}`}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke={aspect.nature === "Hard" ? "var(--pink)" : "var(--cyan)"}
                strokeWidth=".8"
                opacity=".6"
              />
            );
          })}
      {comparison &&
        natalPoints.map((planet) => {
          const p = toPoint(planet.longitude, 68);
          return (
            <g key={planet.name}>
              <circle cx={p.x} cy={p.y} r="8" fill="var(--panel)" />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="var(--purple)"
              >
                {(PLANET_GLYPHS[planet.name] ?? planet.name.slice(0, 1)) +
                  "\uFE0E"}
              </text>
            </g>
          );
        })}
      {points.map((planet) => (
        <g key={planet.name}>
          <circle
            cx={planet.x}
            cy={planet.y}
            r="10"
            fill="var(--panel)"
            stroke="var(--line)"
            strokeWidth=".65"
          />
          <text
            x={planet.x}
            y={planet.y + 4}
            textAnchor="middle"
            fill="var(--ink)"
            fontSize={planet.name === "Asc" ? "8" : "13"}
          >
            {(PLANET_GLYPHS[planet.name] ?? planet.name.slice(0, 1)) + "\uFE0E"}
          </text>
        </g>
      ))}
      <circle cx="200" cy="200" r="3" fill="var(--purple)" />
      <path
        d="M200 188v-7m0 38v-7m-12-12h-7m38 0h-7"
        stroke="var(--purple)"
        strokeWidth=".7"
        opacity=".6"
      />
      <g stroke="var(--line)" strokeWidth=".7">
        <path d="M12 19h14m-7-7v14M374 19h14m-7-7v14M12 381h14m-7-7v14M374 381h14m-7-7v14" />
      </g>
    </svg>
  );
}
