import React from 'react';
import { Aspect, TransitPlanet } from '../types';
import { aspectGlyph, aspectName, formatDegree, planetName, signName } from '../services/astroDisplay';
import Icon from './Icon';
import AstroWheel from './AstroWheel';

interface Props {
  transits: TransitPlanet[]; aspects: Aspect[]; updatedAt: Date | null;
  onNavigate: (view: 'home' | 'natal' | 'transits' | 'oracle') => void;
  onAspectClick: (aspect: Aspect) => void; onQuestion: (question: string) => void;
}
export default function Dashboard({ transits, aspects, updatedAt, onNavigate, onAspectClick, onQuestion }: Props) {
  const moon = transits.find(planet => planet.name === 'Moon');
  const sun = transits.find(planet => planet.name === 'Sun');
  const retrogrades = transits.filter(planet => planet.isRetrograde);
  const date = updatedAt ?? new Date();
  return <div className="dashboard page-enter">
    <div className="page-heading"><div><span className="eyebrow">TU OBSERVATORIO PERSONAL</span><h1>Hola, piloto<span className="heading-star">✳</span></h1><p>Hacé una pausa. Mirá qué está pasando ahí arriba.</p></div><div className="date-stamp"><Icon name="calendar" size={17} /><span>{date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })}</span></div></div>
    <section className="hero-card" aria-labelledby="hero-title">
      <div className="hero-copy"><span className="pill"><span className="status-dot" />UNA CONEXIÓN CON TU UNIVERSO</span><h2 id="hero-title">Mirar arriba.<br /><em>Volver a vos.</em></h2><p>El cielo está en movimiento.<br />Explorá cómo se encuentra con tu mapa.</p><button className="button primary" onClick={() => onNavigate('transits')}>Explorar mis tránsitos<Icon name="arrow" size={18} /></button><div className="hero-footnote"><span className="little-orbit">◎</span>Un poco de perspectiva, todos los días.</div></div>
      <div className="hero-chart"><div className="chart-caption"><span>EL CIELO AHORA</span><span className="live-label"><i />EN VIVO</span></div><AstroWheel transits={transits} /><div className="chart-caption bottom"><span>ZODÍACO TROPICAL</span><span>{updatedAt ? updatedAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }) : '--:--'} <span className="muted">ART · UTC−3</span></span></div></div>
    </section>
    <div className="sky-metrics">
      <button className="metric" onClick={() => onNavigate('transits')}><span className="metric-icon moon-icon"><Icon name="moon" size={23} /></span><span><span className="metric-label">LA LUNA DE HOY</span><strong>{moon ? `Luna en ${signName(moon.sign)}` : 'Conectando con el cielo'}</strong><small>{moon ? `${formatDegree(moon.signDegree)} · posición actual` : 'Cargando posiciones'}</small></span><Icon name="chevron" size={16} /></button>
      <button className="metric" onClick={() => onNavigate('transits')}><span className="metric-icon sun-icon"><Icon name="sun" size={23} /></span><span><span className="metric-label">TEMPORADA SOLAR</span><strong>{sun ? `Sol en ${signName(sun.sign)}` : 'Cargando el Sol'}</strong><small>{sun ? `${formatDegree(sun.signDegree)} · zodíaco tropical` : 'Esperando posiciones'}</small></span><Icon name="chevron" size={16} /></button>
      <button className="metric" onClick={() => onNavigate('transits')}><span className="metric-icon retro-icon"><Icon name="refresh" size={23} /></span><span><span className="metric-label">MOVIMIENTO RETRÓGRADO</span><strong>{transits.length ? `${retrogrades.length} planetas retrógrados` : 'Cargando movimientos'}</strong><small>{retrogrades.map(planet => planetName(planet.name)).join(', ') || 'Sin retrogradaciones detectadas'}</small></span><Icon name="chevron" size={16} /></button>
    </div>
    <div className="dashboard-bottom">
      <section className="panel aspects-preview"><div className="section-heading"><div><span className="eyebrow">EN TU ÓRBITA</span><h2>Conexiones del momento</h2></div><button className="text-button" onClick={() => onNavigate('transits')}>Ver todas<Icon name="arrow" size={15} /></button></div><div className="aspect-preview-list">{aspects.slice(0, 3).map(aspect => <button className="aspect-row" key={`${aspect.transitingPlanet}-${aspect.natalPlanet}-${aspect.type}`} onClick={() => onAspectClick(aspect)}><span className={`aspect-symbol ${aspect.nature.toLowerCase()}`}>{aspectGlyph(aspect.type)}</span><span className="aspect-row-copy"><strong>{planetName(aspect.transitingPlanet)} <span>{aspectName(aspect.type).toLowerCase()}</span> {planetName(aspect.natalPlanet)}</strong><small>Tránsito a tu carta natal</small></span><span className="orb-label">{aspect.orb.toFixed(2)}°<small>de orbe</small></span><Icon name="chevron" size={15} /></button>)}{!aspects.length && <p className="empty-copy">{transits.length ? 'No hay aspectos dentro de los orbes configurados.' : 'Estamos conectando con las posiciones del cielo.'}</p>}</div></section>
      <section className="oracle-card"><span className="eyebrow"><Icon name="spark" size={15} /> EL ORÁCULO</span><h2>Tu pregunta es<br />un buen comienzo.</h2><p>Un espacio para conectar los símbolos del cielo con lo que te pasa.</p><button className="oracle-prompt" onClick={() => onQuestion('¿Qué conexiones con mi carta natal puedo explorar hoy?')}>¿Qué puedo explorar hoy?<Icon name="arrow" size={17} /></button><div className="oracle-card-footer"><span className="tiny-spark">✳</span>Astrología + inteligencia artificial</div></section>
    </div>
  </div>;
}

