import React from 'react';
import { NATAL_DATA, PLANET_GLYPHS } from '../constants';
import { formatDegree, planetName, signName } from '../services/astroDisplay';
import AstroWheel from './AstroWheel';
import Icon from './Icon';

export default function ChartView({ onQuestion }: { onQuestion: (question: string) => void }) {
  return <div className="page-enter"><div className="page-heading"><div><span className="eyebrow">TU PUNTO DE PARTIDA</span><h1>Un mapa, muchas lecturas.</h1><p>Las posiciones de tu carta natal, en un solo lugar.</p></div><span className="outline-badge">PERFIL · PATRICIO</span></div>
    <div className="natal-highlights">{['Sol', 'Luna', 'Asc'].map(name => <div key={name} className="natal-highlight"><span>{PLANET_GLYPHS[name]}</span><div><small>{planetName(name)}</small><strong>{signName(NATAL_DATA[name].sign)}</strong><p>{formatDegree(NATAL_DATA[name].deg)}</p></div></div>)}</div>
    <div className="chart-view-grid"><section className="panel natal-wheel-panel"><div className="section-heading"><h2>Tu carta natal</h2><span className="eyebrow">ZODÍACO TROPICAL</span></div><AstroWheel natal /><div className="chart-legend"><span><i className="legend-teal" />Relaciones armónicas</span><span><i className="legend-peach" />Relaciones de tensión</span></div></section><section className="panel placements-panel"><div className="section-heading"><h2>Posiciones guardadas</h2></div><p className="panel-description">Elegí un punto para preparar una consulta al oráculo.</p><div className="placement-list">{Object.entries(NATAL_DATA).map(([name, data]) => <button className="placement-row" key={name} onClick={() => onQuestion(`¿Cómo puedo interpretar mi ${planetName(name)} natal en ${signName(data.sign)}, a ${formatDegree(data.deg)}?`)}><span className="planet-glyph">{PLANET_GLYPHS[name]}</span><strong>{planetName(name)}</strong><span>{signName(data.sign)}</span><span className="degree">{formatDegree(data.deg)}</span><Icon name="chevron" size={14} /></button>)}</div><div className="notice"><Icon name="info" size={16} /><span>Este perfil usa las posiciones guardadas en la versión original. Aún no se recalculan desde datos de nacimiento.</span></div></section></div>
  </div>;
}
