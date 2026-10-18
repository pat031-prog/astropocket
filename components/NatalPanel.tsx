import React, { useMemo } from 'react';
import { NATAL_DATA, SOULFILE_METADATA, ZODIAC_SIGNS, PLANET_GLYPHS, ZODIAC_GLYPHS } from '../constants';
import { NatalPlanet } from '../types';

interface NatalPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onPlanetClick?: (planet: string, data: NatalPlanet) => void;
}

const NatalPanel: React.FC<NatalPanelProps> = ({ isOpen, onToggle, onPlanetClick }) => {
  
  // Calculate Chart Geometry
  const { chartPoints, internalAspects, ringRotation } = useMemo(() => {
    
    const getLong = (sign: string, deg: number) => {
        const idx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase().startsWith(sign.toLowerCase().substring(0,3)));
        return (idx * 30) + deg;
    };

    // Ascendant Calculation
    const ascData = NATAL_DATA['Asc'];
    const ascLong = getLong(ascData.sign, ascData.deg);
    
    // We want ASC at 180 degrees (Left side of circle).
    const points = Object.entries(NATAL_DATA).map(([planet, data]) => {
      const absDeg = getLong(data.sign, data.deg);
      
      // Calculate angular distance from Ascendant
      let relDeg = absDeg - ascLong;
      
      const visualAngle = 180 + relDeg;
      const radians = (visualAngle * Math.PI) / 180;
      
      // Radius layers
      const r = 38; // Planets ring

      return {
        planet,
        x: 50 + r * Math.cos(radians), 
        y: 50 + r * Math.sin(radians) * -1, // Invert Y for correct orientation
        deg: absDeg,
        visualAngle,
        glyph: PLANET_GLYPHS[planet] || planet.substring(0, 1)
      };
    });

    const aspects: {x1: number, y1: number, x2: number, y2: number, type: string}[] = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];
            
            if (['Asc', 'Mc', 'NodoN'].includes(p1.planet) || ['Asc', 'Mc', 'NodoN'].includes(p2.planet)) continue;

            let diff = Math.abs(p1.deg - p2.deg);
            if (diff > 180) diff = 360 - diff;

            if (Math.abs(diff - 120) < 8) aspects.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, type: 'trine' });
            else if (Math.abs(diff - 90) < 8) aspects.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, type: 'square' });
            else if (Math.abs(diff - 180) < 8) aspects.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, type: 'opposition' });
            else if (Math.abs(diff - 60) < 5) aspects.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, type: 'sextile' });
        }
    }

    const ringRotation = 180 - ascLong;

    return { chartPoints: points, internalAspects: aspects, ringRotation };
  }, []);

  return (
    <aside 
      className={`
        relative flex flex-col h-full glass-panel md:border-r border-white/5 
        backdrop-blur-xl bg-deep/95 md:bg-deep/80 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20
        transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        w-full ${isOpen ? 'md:w-[360px]' : 'md:w-[60px]'}
        overflow-hidden
      `}
    >
      {/* Toggle */}
      <button 
        onClick={onToggle}
        className="hidden md:flex absolute top-1/2 -right-3 w-6 h-12 items-center justify-center bg-deep border border-white/10 text-gray-500 hover:text-white rounded-r-sm z-50 cursor-pointer transition-all"
        style={{ transform: 'translateY(-50%)' }}
      >
        <span className="text-[10px] font-mono">{isOpen ? '◄' : '►'}</span>
      </button>

      {/* EXPANDED CONTENT */}
      <div className={`flex flex-col h-full p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
        
        {/* Minimal Header */}
        <div className="mb-8 border-b border-white/5 pb-4">
          <div className="flex justify-between items-end">
            <h2 className="font-mono text-xs text-gray-400 tracking-[0.2em] uppercase">Natal Map</h2>
            <span className="font-mono text-[9px] text-accent-primary/60">{SOULFILE_METADATA.identidad.split(' ')[0]}</span>
          </div>
        </div>

        {/* MINIMAL CHART WHEEL */}
        <div className="mb-8 flex justify-center items-center flex-1">
          <div className="relative w-64 h-64 select-none">
             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                
                {/* 1. Base Structure Rings (Thin) */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" strokeDasharray="2 2" />

                {/* 2. Zodiac Ring (Rotated based on Ascendant) */}
                <g transform={`rotate(0, 50, 50)`}> 
                    {ZODIAC_GLYPHS.map((glyph, i) => {
                        // Visual geometry math
                        const rGlyph = 44;
                        const rLabel = 52;
                        
                        // Current Sign Angle relative to Ascendant rotation
                        const glyphAngle = (i * 30) + 15 - (NATAL_DATA['Asc'].deg + (ZODIAC_SIGNS.findIndex(s => s.startsWith(NATAL_DATA['Asc'].sign.substring(0,3)))*30)) + 180;
                        const rad = (glyphAngle * Math.PI) / 180;
                        const gx = 50 + rGlyph * Math.cos(rad);
                        const gy = 50 + rGlyph * Math.sin(rad) * -1;
                        
                        const lx = 50 + rLabel * Math.cos(rad);
                        const ly = 50 + rLabel * Math.sin(rad) * -1;

                        // Divider lines
                        const divAngle = (i * 30) - (NATAL_DATA['Asc'].deg + (ZODIAC_SIGNS.findIndex(s => s.startsWith(NATAL_DATA['Asc'].sign.substring(0,3)))*30)) + 180;
                        const divRad = (divAngle * Math.PI) / 180;
                        const x1 = 50 + 40 * Math.cos(divRad);
                        const y1 = 50 + 40 * Math.sin(divRad) * -1;
                        const x2 = 50 + 48 * Math.cos(divRad);
                        const y2 = 50 + 48 * Math.sin(divRad) * -1;

                        return (
                            <g key={i}>
                                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
                                <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="3" fill="rgba(255,255,255,0.3)" className="font-mono">{glyph}</text>
                                {/* Added Sign Names (Abbreviations) */}
                                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="2" fill="rgba(255,255,255,0.15)" className="font-mono tracking-widest">
                                    {ZODIAC_SIGNS[i].substring(0,3).toUpperCase()}
                                </text>
                            </g>
                        );
                    })}
                </g>

                {/* 3. House Cusps */}
                {Array.from({ length: 12 }).map((_, i) => {
                     const angle = 180 + (i * 30); // 1st house starts at 180
                     const rad = (angle * Math.PI) / 180;
                     const x1 = 50 + 10 * Math.cos(rad);
                     const y1 = 50 + 10 * Math.sin(rad) * -1;
                     const x2 = 50 + 48 * Math.cos(rad);
                     const y2 = 50 + 48 * Math.sin(rad) * -1;
                     return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" strokeDasharray="1 1" />;
                })}

                {/* 4. Aspect Lines */}
                {internalAspects.map((aspect, i) => (
                    <line 
                        key={i} 
                        x1={aspect.x1} y1={aspect.y1} 
                        x2={aspect.x2} y2={aspect.y2} 
                        stroke={
                            aspect.type === 'trine' ? '#4ea8de' : 
                            aspect.type === 'square' ? '#ef5350' : 
                            aspect.type === 'opposition' ? '#ef5350' :
                            '#e0aaff'
                        } 
                        strokeWidth="0.2"
                        opacity="0.6"
                    />
                ))}

                {/* 5. Planets */}
                {chartPoints.map((pt, i) => (
                  <g key={pt.planet} onClick={() => onPlanetClick && onPlanetClick(pt.planet, NATAL_DATA[pt.planet])} className="cursor-pointer hover:opacity-80">
                    <line 
                        x1={50 + 36 * Math.cos(pt.visualAngle * Math.PI / 180)} 
                        y1={50 + 36 * Math.sin(pt.visualAngle * Math.PI / 180) * -1}
                        x2={pt.x} y2={pt.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth="0.2"
                    />
                    <circle cx={pt.x} cy={pt.y} r="2.5" fill="#05020a" stroke="transparent" strokeWidth="2" className="hover:stroke-white/20" />
                    <text 
                        x={pt.x} 
                        y={pt.y} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        fill={['Sol', 'Luna', 'Asc'].includes(pt.planet) ? '#fff' : '#aaa'} 
                        fontSize="3.5"
                        fontWeight={['Sol', 'Luna', 'Asc'].includes(pt.planet) ? 'bold' : 'normal'}
                    >
                        {pt.glyph}
                    </text>
                  </g>
                ))}
                
                {/* Ascendant Arrow */}
                <path d="M 40 50 L 50 50" stroke="#ef5350" strokeWidth="0.3" markerEnd="url(#arrow)" />
                <text x="38" y="50" fontSize="2" fill="#ef5350" textAnchor="end" dominantBaseline="central">AS</text>
             </svg>
          </div>
        </div>

        {/* Minimal Data List */}
        <div className="h-1/3 overflow-y-auto pr-1 border-t border-white/5 pt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {chartPoints.map((pt) => (
              <div 
                  key={pt.planet} 
                  onClick={() => onPlanetClick && onPlanetClick(pt.planet, NATAL_DATA[pt.planet])}
                  className="flex items-center justify-between text-[10px] text-gray-400 font-mono hover:bg-white/5 p-1 rounded cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2">
                    <span className="text-gray-200 group-hover:text-accent-secondary">{pt.glyph}</span>
                    <span className="opacity-50">{pt.planet.substring(0,3).toUpperCase()}</span>
                </div>
                <div>
                   {NATAL_DATA[pt.planet].sign.substring(0,3).toUpperCase()} <span className="text-gray-200">{Math.floor(NATAL_DATA[pt.planet].deg)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Spine */}
      <div className={`hidden md:flex flex-col items-center justify-center h-full gap-8 transition-opacity duration-300 ${!isOpen ? 'opacity-100 delay-150' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
        <div onClick={onToggle} className="cursor-pointer text-gray-600 hover:text-white transition-colors">
            <span className="text-xs font-mono">N</span>
        </div>
        <div className="w-px h-16 bg-white/10"></div>
        <div onClick={onToggle} className="cursor-pointer text-gray-600 hover:text-white transition-colors">
            <span className="text-xs font-mono">T</span>
        </div>
      </div>
    </aside>
  );
};

export default NatalPanel;
