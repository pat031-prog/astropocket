import React, { useId } from "react";

export const NOVAS = [
  {
    id: "classic",
    name: "Nova",
    number: "09",
    note: "La señal original",
    color: "#deb5fa",
    reference: "ASTROPOCKET ORIGINAL",
    description: "Las antenas, el monitor y las tres luces de siempre. El primero en escuchar al cielo.",
  },
  {
    id: "mimo",
    name: "Mimo",
    number: "02",
    note: "Homenaje a Tamagotchi",
    color: "#9ce2ce",
    reference: "MASCOTA LCD / 1996",
    description: "Un huevo de bolsillo, tres botones y una pequeña criatura pixelada que vive en la pantalla.",
  },
  {
    id: "pocket",
    name: "Volt",
    number: "03",
    note: "Homenaje a Pokémon",
    color: "#f3d470",
    reference: "CRIATURA DE BOLSILLO",
    description: "Orejas atentas, mejillas cargadas y una cola de rayo. Un pequeño compañero para una aventura enorme.",
  },
  {
    id: "orbit",
    name: "Seraf",
    number: "04",
    note: "No temas",
    color: "#e8cba1",
    reference: "VISIÓN CELESTE",
    description: "Seis alas, ruedas entrelazadas y muchos ojos abiertos. Una aparición inspirada en los ángeles bíblicos.",
  },
  {
    id: "bit",
    name: "Nulo",
    number: "05",
    note: "Algo cruzó la señal",
    color: "#b0f3bd",
    reference: "ANOMALÍA / SIN CLASIFICAR",
    description: "Una medusa de otro plano. Tiene un ojo imposible, satélites propios y muy buenas intenciones. Creemos.",
  },
] as const;
export type NovaDesign = (typeof NOVAS)[number]["id"];
export default function NovaShell({
  face,
  design = "classic",
}: {
  face?: React.Ref<HTMLDivElement>;
  design?: NovaDesign;
}) {
  const id = useId().replace(/:/g, "");
  if (design !== "classic") {
    return (
      <span className={`nova-art art-${design}`} aria-hidden="true">
        <svg viewBox="0 0 160 160" fill="none" className="nova-illustration">
          <defs>
            <linearGradient id={`${id}-shell`} x1="20" y1="15" x2="130" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor={design === "mimo" ? "#efb9db" : design === "pocket" ? "#fff1a1" : design === "orbit" ? "#fff2cd" : "#c8f9c5"} />
              <stop offset="1" stopColor={design === "mimo" ? "#a89bd5" : design === "pocket" ? "#e4a745" : design === "orbit" ? "#b68b69" : "#6799bc"} />
            </linearGradient>
            <radialGradient id={`${id}-eye`}>
              <stop stopColor="#efffe7" /><stop offset=".55" stopColor="#9cf1c7" /><stop offset="1" stopColor="#649eb8" />
            </radialGradient>
          </defs>
          {design === "mimo" && <>
            <ellipse cx="80" cy="145" rx="42" ry="6" fill="#3a2d5130" />
            <path d="M73 20C66 9 72 2 80 4c9 2 10 12 4 17" stroke="#e5c89f" strokeWidth="5" />
            <path d="M80 16c-29 0-57 39-57 76 0 36 23 51 57 51s57-15 57-51c0-37-28-76-57-76Z" fill={`url(#${id}-shell)`} stroke="#59406c" strokeWidth="3" />
            <path d="M43 43c-9 10-14 24-15 37" stroke="#fff3f3" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
            <path d="m44 37 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z" fill="#fff4ab" stroke="#9c7296" strokeWidth="1" />
            <path d="m119 96 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#d8fff2" />
            <rect x="43" y="51" width="74" height="58" rx="10" fill="#66566f" stroke="#f6d5ef" strokeWidth="2" />
            <rect x="49" y="57" width="62" height="46" rx="4" fill="#b7c69c" stroke="#465d58" strokeWidth="2" />
            <path d="M52 60h56M52 64h56M52 68h56M52 72h56M52 76h56M52 80h56M52 84h56M52 88h56M52 92h56M52 96h56" stroke="#8caa8533" />
            <g fill="#344f46" shapeRendering="crispEdges" className="lcd-pet">
              <path d="M70 71h5v-5h10v5h5v5h5v15h-5v5H70v-5h-5V76h5Z" />
              <path d="M60 81h5v5h-5zm35 0h5v5h-5zM70 96h5v5h-5zm15 0h5v5h-5z" />
            </g>
            <g fill="#e9d39c" stroke="#715b7f" strokeWidth="2"><circle cx="57" cy="123" r="6" /><circle cx="80" cy="128" r="6" /><circle cx="103" cy="123" r="6" /></g>
            <path d="M65 35h30" stroke="#a06797" strokeWidth="2" strokeLinecap="round" />
          </>}
          {design === "pocket" && <>
            <ellipse cx="78" cy="148" rx="40" ry="5" fill="#63533630" />
            <path className="volt-tail" d="m112 102 15-24 17 4-12-22 21 8-7 38-15-5-12 24Z" fill="#edbd53" stroke="#89562f" strokeWidth="2.5" strokeLinejoin="round" />
            <path className="volt-ear left" d="M53 68C34 51 29 15 36 10c10 1 27 29 28 49" fill={`url(#${id}-shell)`} stroke="#89562f" strokeWidth="2.5" />
            <path className="volt-ear right" d="M94 60c5-25 22-48 31-45 4 12-6 38-21 54" fill={`url(#${id}-shell)`} stroke="#89562f" strokeWidth="2.5" />
            <path d="M35 12c-2 10 1 21 4 27l12-5C45 20 38 11 35 12Zm88 5c-9 5-14 14-18 23l12 5c5-10 9-22 6-28Z" fill="#4f4254" />
            <path d="M50 97c-12 11-15 37-6 43 8 4 19-1 23-3h24c8 5 17 7 23 2 6-8-1-31-10-42" fill={`url(#${id}-shell)`} stroke="#89562f" strokeWidth="2.5" />
            <ellipse cx="80" cy="119" rx="19" ry="17" fill="#fff1c1" />
            <path d="m47 104-15 8 4 10 19-9m55-9 12 10-7 9-16-12" fill="#f6d577" stroke="#89562f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M45 65c5-20 59-23 68 2 7 20 5 38-30 40-31 1-48-15-38-42Z" fill={`url(#${id}-shell)`} stroke="#89562f" strokeWidth="2.5" />
            <ellipse cx="54" cy="88" rx="8" ry="5" fill="#e99e88" /><ellipse cx="105" cy="88" rx="8" ry="5" fill="#e99e88" />
            <path d="m80 51 3 6-3 6-3-6Z" fill="#fff7d6" />
            <path d="m75 91 5 3 5-3" stroke="#7c503a" strokeWidth="2" strokeLinecap="round" />
            <path d="m40 52-5 4m90-2 5 4" stroke="#ffe9a3" strokeWidth="2" className="volt-sparks" />
          </>}
          {design === "orbit" && <>
            <g className="seraph-wings" fill={`url(#${id}-shell)`} stroke="#a77e5c" strokeWidth="1.2" strokeLinejoin="round">
              <path d="M66 69C43 61 17 26 8 12c0 28 9 47 35 63C26 68 11 59 4 50c2 24 15 39 45 40C27 91 12 92 5 88c9 22 33 24 58 10Z" />
              <path d="M94 69c23-8 49-43 58-57 0 28-9 47-35 63 17-7 32-16 39-25-2 24-15 39-45 40 22 1 37 2 44-2-9 22-33 24-58 10Z" />
              <path d="M39 48 63 73M22 65l37 17M23 92l34-2m64-42L97 73m41-8-37 17m36 10-34-2" stroke="#fff1cf" strokeWidth="2" />
            </g>
            <ellipse cx="80" cy="37" rx="28" ry="9" stroke="#f8dda4" strokeWidth="2" className="seraph-halo" />
            <g className="seraph-wheel wheel-a" stroke="#e6c083" strokeWidth="3"><ellipse cx="80" cy="84" rx="55" ry="23" transform="rotate(-32 80 84)" /><ellipse cx="80" cy="84" rx="52" ry="20" transform="rotate(36 80 84)" /></g>
            <circle cx="80" cy="84" r="30" fill="#f4e7cc" stroke="#a87d5c" strokeWidth="2" />
            <path d="M53 84s12-17 27-17 27 17 27 17-12 17-27 17-27-17-27-17Z" fill="#fff9e4" stroke="#ad8a62" strokeWidth="2" />
            <circle cx="80" cy="84" r="12" fill="#7c8f80" /><circle cx="80" cy="84" r="7" fill="#283936" /><circle cx="83" cy="80" r="3" fill="#fff8da" />
            <g className="seraph-wheel wheel-b" fill="#fff2cf" stroke="#b48b60" strokeWidth="1.5">
              {[[37,68],[54,109],[109,61],[127,98],[80,32],[80,134]].map(([x,y],i)=><g key={i}><path d={`M${x-8} ${y}q8-10 16 0-8 10-16 0Z`} /><circle cx={x} cy={y} r="3" fill="#546b5f" stroke="none" /></g>)}
            </g>
            <path d="m80 116 0 32m-4-7 4 7 4-7" stroke="#d6b479" strokeWidth="1.5" />
          </>}
          {design === "bit" && <>
            <ellipse cx="80" cy="144" rx="34" ry="5" fill="#8ddbc223" />
            <g className="anomaly-satellites" stroke="#cc9bf5" strokeWidth="1.5"><ellipse cx="80" cy="83" rx="68" ry="22" transform="rotate(-22 80 83)" /><circle cx="20" cy="105" r="7" fill="#edb5d5" /><circle cx="144" cy="66" r="5" fill="#aee2fa" /><path d="m129 24 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#ded0fe" /></g>
            <g className="anomaly-tendrils" stroke={`url(#${id}-shell)`} strokeWidth="7" strokeLinecap="round"><path d="M55 105c-13 26 18 22 5 39" /><path d="M75 107c-5 23 16 23 5 42" /><path d="M97 104c21 14-6 25 12 35" /></g>
            <path d="M31 94c0-43 21-71 50-71 32 0 51 35 51 71 0 11-11 8-18 6-5 20-17 12-22 6-13 15-21 5-27 0-19 13-23-7-34-12Z" fill={`url(#${id}-shell)`} fillOpacity=".92" stroke="#b8e7c7" strokeWidth="2" />
            <path d="M43 61c6-16 16-25 27-28" stroke="#e1ffdf" strokeWidth="3" strokeLinecap="round" />
            <path d="M47 75s13-21 32-21 34 21 34 21-15 23-34 23-32-23-32-23Z" fill="#eee6fc" stroke="#637da8" strokeWidth="2" />
            <circle cx="80" cy="75" r="18" fill={`url(#${id}-eye)`} /><circle cx="80" cy="75" r="9" fill="#333256" /><circle cx="85" cy="70" r="4" fill="#f6ffe8" />
            <path d="m55 111 2 4m50-5-2 4" stroke="#eaffd9" strokeWidth="2" />
            <g fill="#e5c5ff" className="anomaly-stars"><circle cx="20" cy="49" r="2" /><circle cx="139" cy="120" r="2" /><path d="m36 23 3 3-3 3-3-3Z" /></g>
          </>}
        </svg>
        <span className="nova-art-face">
          <span className="nova-eyes" ref={face}><i /><i /></span>
          {(design === "mimo" || design === "pocket") && <span className="nova-mouth" />}
        </span>
      </span>
    );
  }
  return (
    <>
      <span className="nova-antenna left" />
      <span className="nova-antenna right" />
      <span className="nova-orbital-ring" />
      <span className="nova-shell">
        <span className="nova-screen">
          <span className="nova-eyes" ref={face}>
            <i />
            <i />
          </span>
          <span className="nova-cheek left" />
          <span className="nova-cheek right" />
          <span className="nova-mouth" />
          <span className="nova-scan" />
        </span>
        <span className="nova-leds">
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="nova-feet">
        <i />
        <i />
      </span>
    </>
  );
}
