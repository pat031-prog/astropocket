import React, { useMemo, useState } from 'react';
import { Aspect, TransitPlanet } from '../types';
import { PLANET_GLYPHS, ZODIAC_GLYPHS, NATAL_DATA, ZODIAC_SIGNS } from '../constants';

interface TransitPanelProps {
  transits: TransitPlanet[];
  aspects: Aspect[];
  onAspectClick: (aspect: Aspect) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TransitPanel: React.FC<TransitPanelProps> = ({ transits, aspects, onAspectClick, isOpen, onToggle }) => {
  const [hoveredAspect, setHoveredAspect] = useState<Aspect | null>(null);

  // Helper to convert Zodiac Sign + Deg to Absolute Longitude (0-360)
  const getAbsoluteLongitude = (sign: string, deg: number) => {
    const idx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase().startsWith(sign.toLowerCase().substring(0,3)));
    return (idx * 30) + deg;
  };

  // Helper for polar coordinates
  // 0 Aries starts at 9 o'clock (180 degrees in CSS/SVG standard rotation)
  const getCoordinates = (longitude: number, radius: number) => {
    const visualAngle = 180 - longitude; 
    const radians = (visualAngle * Math.PI) / 180;
    return {
        x: 50 + radius * Math.cos(radians),
        y: 50 + radius * Math.sin(radians) * -1
    };
  };

  const visualizationData = useMemo(() => {
    // 1. Calculate Transiting Planets (Outer Ring)
    const transitPoints = transits.map(t => {
        const coords = getCoordinates(t.longitude, 42); // Radius 42
        return {
            ...t,
            x: coords.x,
            y: coords.y,
            glyph: PLANET_GLYPHS[t.name] || t.name[0]
        };
    });

    // 2. Calculate Natal Planets (Inner Ring)
    // We filter out purely mathematical points if desired, but keeping major ones
    const natalPoints = Object.entries(NATAL_DATA).map(([name, data]) => {
        const longitude = getAbsoluteLongitude(data.sign, data.deg);
        const coords = getCoordinates(longitude, 28); // Radius 28
        return {
            name,
            longitude,
            x: coords.x,
            y: coords.y,
            glyph: PLANET_GLYPHS[name] || name[0],
            sign: data.sign,
            deg: data.deg
        };
    });

    // 3. Calculate Aspect Lines (Connect Outer to Inner)
    const aspectLines = aspects.map(aspect => {
        const tPoint = transitPoints.find(t => t.name === aspect.transitingPlanet);
        const nPoint = natalPoints.find(n => n.name === aspect.natalPlanet);

        if (!tPoint || !nPoint) return null;

        return {
            x1: tPoint.x,
            y1: tPoint.y,
            x2: nPoint.x,
            y2: nPoint.y,
            nature: aspect.nature,
            type: aspect.type,
            orb: aspect.orb,
            obj: aspect
        };
    }).filter(Boolean) as {x1: number, y1: number, x2: number, y2: number, nature: string, type: string, orb: number, obj: Aspect}[];

    return { transitPoints, natalPoints, aspectLines };
  }, [transits, aspects]);

  return (
    <aside 
      className={`
        relative flex flex-col h-full glass-panel md:border-l border-white/5 
        backdrop-blur-xl bg-deep/95 md:bg-deep/80 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20
        transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        w-full ${isOpen ? 'md:w-[380px]' : 'md:w-[60px]'}
        overflow-hidden
      `}
    >
       {/* Toggle */}
       <button 
        onClick={onToggle}
        className="hidden md:flex absolute top-1/2 -left-3 w-6 h-12 items-center justify-center bg-deep border border-white/10 text-gray-500 hover:text-white rounded-l-sm z-50 cursor-pointer transition-all"
        style={{ transform: 'translateY(-50%)' }}
      >
        <span className="text-[10px] font-mono">{isOpen ? '►' : '◄'}</span>
      </button>

      {/* EXPANDED CONTENT */}
      <div className={`flex flex-col h-full transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
        
        {/* Header */}
        <div className="p-6 pb-2 border-b border-white/5 flex justify-between items-end shrink-0">
            <div>
                <h2 className="font-mono text-xs text-gray-400 tracking-[0.2em] uppercase">Bi-Wheel Scan</h2>
                <p className="text-[9px] text-gray-600 font-mono mt-1">OUTER: TRANSIT • INNER: NATAL</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-pulse shadow-[0_0_8px_#4ea8de]"></span>
                <span className="font-mono text-[9px] text-accent-secondary">LIVE LINK</span>
            </div>
        </div>

        {/* BI-WHEEL VISUALIZATION */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[320px] aspect-square select-none">
             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                
                {/* 1. Zodiac Marks (Static Background) */}
                {ZODIAC_GLYPHS.map((glyph, i) => {
                    const angle = 180 - (i * 30);
                    const rad = (angle * Math.PI) / 180;
                    
                    const x1 = 50 + 48 * Math.cos(rad);
                    const y1 = 50 + 48 * Math.sin(rad) * -1;
                    const x2 = 50 + 50 * Math.cos(rad);
                    const y2 = 50 + 50 * Math.sin(rad) * -1;
                    
                    // Glyph label
                    const labelRad = ((angle - 15) * Math.PI) / 180;
                    const lx = 50 + 54 * Math.cos(labelRad);
                    const ly = 50 + 54 * Math.sin(labelRad) * -1;

                    return (
                        <g key={i}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
                            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="2.5" fill="rgba(255,255,255,0.15)">{glyph}</text>
                        </g>
                    );
                })}

                {/* 2. Concentric Rings */}
                {/* Outer Ring (Transit) */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(78, 168, 222, 0.1)" strokeWidth="0.1" strokeDasharray="2 1" />
                {/* Inner Ring (Natal) */}
                <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255, 214, 10, 0.1)" strokeWidth="0.1" strokeDasharray="2 1" />

                {/* 3. Aspect Lines (Connectors) */}
                {visualizationData.aspectLines.map((line, i) => {
                    const isHovered = hoveredAspect === line.obj;
                    const opacity = isHovered ? 1 : hoveredAspect ? 0.1 : 0.4;
                    const width = isHovered ? 0.6 : 0.2;
                    const color = line.nature === 'Hard' ? '#ef5350' : line.nature === 'Soft' ? '#4ea8de' : '#ffa726';

                    return (
                        <line 
                            key={i}
                            x1={line.x1} y1={line.y1}
                            x2={line.x2} y2={line.y2}
                            stroke={color}
                            strokeWidth={width}
                            opacity={opacity}
                            strokeDasharray={line.nature === 'Neutral' ? '1 1' : 'none'}
                        />
                    );
                })}

                {/* 4. Natal Planets (Inner) */}
                {visualizationData.natalPoints.map((pt) => (
                    <g key={`n-${pt.name}`}>
                        <circle cx={pt.x} cy={pt.y} r="1.5" fill="#05020a" stroke="rgba(255, 214, 10, 0.5)" strokeWidth="0.5" />
                        <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central" fontSize="2" fill="rgba(255, 214, 10, 0.8)">{pt.glyph}</text>
                    </g>
                ))}

                {/* 5. Transit Planets (Outer) */}
                {visualizationData.transitPoints.map((pt) => (
                     <g key={`t-${pt.name}`}>
                        <circle cx={pt.x} cy={pt.y} r="2" fill="#05020a" stroke="rgba(78, 168, 222, 0.8)" strokeWidth="0.5" />
                        <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central" fontSize="2.5" fill="#4ea8de" fontWeight="bold">{pt.glyph}</text>
                        {pt.isRetrograde && <text x={pt.x + 2} y={pt.y - 1} fontSize="1.5" fill="#ef5350">R</text>}
                    </g>
                ))}

                {/* Center Core */}
                <circle cx="50" cy="50" r="1.5" fill="#fff" opacity="0.1" />
             </svg>
          </div>
        </div>

        {/* Aspect List (Interactive) */}
        <div className="h-1/3 min-h-[160px] overflow-y-auto border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="p-4 space-y-2">
                {aspects.length === 0 ? (
                    <div className="text-center text-gray-600 text-[10px] py-4">NO MAJOR ASPECTS DETECTED</div>
                ) : (
                    aspects.map((aspect, idx) => (
                        <button
                            key={idx}
                            onClick={() => onAspectClick(aspect)}
                            onMouseEnter={() => setHoveredAspect(aspect)}
                            onMouseLeave={() => setHoveredAspect(null)}
                            className={`
                                w-full flex items-center justify-between p-2 rounded transition-all duration-200 border
                                ${hoveredAspect === aspect 
                                    ? 'bg-white/10 border-white/20 translate-x-1' 
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
                            `}
                        >
                            {/* Left: Transit Planet */}
                            <div className="flex items-center gap-3 w-1/3">
                                <span className="text-accent-secondary font-mono text-xs">{PLANET_GLYPHS[aspect.transitingPlanet]}</span>
                                <span className="text-[10px] text-gray-300 font-mono hidden sm:inline">{aspect.transitingPlanet.substring(0,3).toUpperCase()}</span>
                            </div>

                            {/* Center: Aspect Symbol */}
                            <div className="flex flex-col items-center justify-center w-1/3">
                                <span className={`
                                    text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-wider
                                    ${aspect.nature === 'Hard' ? 'text-status-hard bg-status-hard/10' : 
                                      aspect.nature === 'Soft' ? 'text-status-soft bg-status-soft/10' : 
                                      'text-status-neutral bg-status-neutral/10'}
                                `}>
                                    {aspect.type === 'Conjunction' ? 'CON' : 
                                     aspect.type === 'Opposition' ? 'OPP' : 
                                     aspect.type === 'Square' ? 'SQR' : 
                                     aspect.type === 'Trine' ? 'TRI' : aspect.type.toUpperCase().substring(0,3)}
                                </span>
                                <span className="text-[8px] text-gray-600 mt-0.5">{aspect.orb.toFixed(1)}° orb</span>
                            </div>

                            {/* Right: Natal Planet */}
                            <div className="flex items-center gap-3 w-1/3 justify-end">
                                <span className="text-[10px] text-accent-personal/80 font-mono hidden sm:inline">{aspect.natalPlanet.substring(0,3).toUpperCase()}</span>
                                <span className="text-accent-personal font-mono text-xs">{PLANET_GLYPHS[aspect.natalPlanet]}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Vertical Spine (Collapsed State) */}
      <div className={`hidden md:flex flex-col items-center justify-center h-full gap-8 transition-opacity duration-300 ${!isOpen ? 'opacity-100 delay-150' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
        <div onClick={onToggle} className="cursor-pointer text-gray-600 hover:text-white transition-colors">
            <span className="text-xs font-mono">S</span>
        </div>
        <div className="w-px h-16 bg-white/10"></div>
        <div onClick={onToggle} className="cursor-pointer text-gray-600 hover:text-white transition-colors">
            <span className="text-xs font-mono">C</span>
        </div>
      </div>
    </aside>
  );
};

export default TransitPanel;