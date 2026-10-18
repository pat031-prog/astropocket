import React, { useLayoutEffect, useRef } from "react";
import NovaShell, { NOVAS, type NovaDesign } from "./NovaShell";
import { THEMES, type Appearance, type AppearancePanel } from "../services/appearance";
import VoiceSettings from "./VoiceSettings";

export default function NovaCollection({ current, onChoose, dialog, appearance, onAppearance, panel, onPanel }: {
  current: NovaDesign;
  onChoose: (design: NovaDesign) => void;
  dialog: React.RefObject<HTMLDialogElement>;
  appearance: Appearance;
  onAppearance: (value: Appearance) => void;
  panel: AppearancePanel;
  onPanel: (value: AppearancePanel) => void;
}) {
  const chosen = NOVAS.find(n => n.id === current) || NOVAS[0];
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { if (content.current) content.current.scrollTop = 0; }, [panel]);
  return (
    <dialog ref={dialog} className="console-dialog nova-collection appearance-dialog" aria-labelledby="appearance-title"
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.current?.close();
      }}>
      <div className="module-heading appearance-heading">
        <span id="appearance-title">TALLER / TU ASTROPOCKET</span>
        <button aria-label="Cerrar personalización" onClick={() => dialog.current?.close()}>×</button>
      </div>
      <div className="appearance-tabs" role="tablist" aria-label="Personalización">
        {([["nova", "01", "Tu Nova"], ["theme", "02", "La consola"], ["reading", "03", "La lectura"]] as const).map(([id, number, title], index) => (
          <button key={id} id={`appearance-tab-${id}`} role="tab" aria-selected={panel === id} aria-controls={`appearance-panel-${id}`} tabIndex={panel === id ? 0 : -1}
            onClick={() => onPanel(id)}
            onKeyDown={event => {
              const tabs: AppearancePanel[] = ["nova", "theme", "reading"];
              const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
              if (next < 0) return;
              event.preventDefault(); onPanel(tabs[next]); document.getElementById(`appearance-tab-${tabs[next]}`)?.focus();
            }}><span>{number}</span>{title}</button>
        ))}
      </div>
      <div ref={content} className="appearance-content" role="tabpanel" id={`appearance-panel-${panel}`} aria-labelledby={`appearance-tab-${panel}`}>
        {panel === "nova" ? <div className="nova-workshop">
          <div className={`nova-exhibit variant-${current}`}>
            <span className="exhibit-code">UNIT / {chosen.number}</span>
            <div className="exhibit-portrait"><span className="exhibit-orbit" /><span className="nova-robot"><NovaShell design={current} /></span></div>
            <span className="exhibit-reference">{chosen.reference}</span>
            <h2>{chosen.name}<span>● ONLINE</span></h2>
            <p>{chosen.description}</p>
            <span className="exhibit-memory">Una misma memoria. Otra forma de acompañarte.</span>
          </div>
          <div className="nova-designs" aria-label="Diseños de Nova">
            {NOVAS.map(nova => <button key={nova.id} aria-pressed={nova.id === current} aria-label={`${nova.name}: ${nova.note}`} className={`nova-design variant-${nova.id}`} onClick={() => onChoose(nova.id)}>
              <span className="design-number">{nova.number}<span>{current === nova.id ? "●" : "○"}</span></span>
              <span className="design-preview"><span className="nova-robot" aria-hidden="true"><NovaShell design={nova.id} /></span></span>
              <strong>{nova.name}</strong><small>{nova.note}</small>
            </button>)}
          </div>
        </div> : panel === "theme" ? <>
          <div className="appearance-intro"><span>CAMBIÁ DE ATMÓSFERA</span><h2>Tu pequeña estación.</h2><p>Probá un tema. Cambian los paneles, las cartas y la conversación.</p></div>
          <div className="theme-options" role="radiogroup" aria-label="Tema de la consola">
            {THEMES.map(theme => <label key={theme.id} className={`theme-card preview-${theme.id}`} data-selected={appearance.theme === theme.id}>
              <input type="radio" name="console-theme" aria-label={theme.name} checked={appearance.theme === theme.id} onChange={() => onAppearance({ ...appearance, theme: theme.id })} />
              <span className="theme-mini" aria-hidden="true"><span className="mini-top">✳ ASTROPOCKET<i /><i /><i /></span><span className="mini-layout"><span className="mini-wheel">☉</span><span className="mini-chat"><i /><i /><i /><span>Hablemos del cielo… ↵</span></span></span></span>
              <span className="theme-info"><span>{theme.label}</span><strong>{theme.name}<b>{appearance.theme === theme.id ? "✓" : "↗"}</b></strong><small>{theme.note}</small><span className="theme-swatches">{theme.colors.map(color => <i key={color} style={{background:color}} />)}<span>{appearance.theme === theme.id ? "EN USO" : "PROBAR TEMA"}</span></span></span>
            </label>)}
          </div>
        </> : <>
          <div className="appearance-intro"><span>HACÉ LUGAR PARA LEER</span><h2>A tu ritmo.</h2><p>El texto y el movimiento también son parte de la experiencia.</p></div>
          <fieldset className="reading-settings"><legend>Tamaño de la conversación</legend><div className="reading-size-options">
            {([["comfortable","Cómoda","Aa"],["large","Grande","Aa"],["extra","Extra","Aa"]] as const).map(([id,label,sample]) => <button key={id} className={`size-${id}`} aria-pressed={appearance.reading === id} onClick={() => onAppearance({...appearance,reading:id})}><span>{sample}</span>{label}</button>)}
          </div></fieldset>
          <div className="reading-sample"><span>✳ NOVA</span><p>Hay algo moviéndose ahí arriba. Podemos mirar el cielo de hoy y charlar de lo que te pasa.</p><small>Así se va a ver la conversación.</small></div>
          <label className="calm-option"><span><strong>Una señal más tranquila</strong><small>Pausa los movimientos continuos de Nova. Conserva sus gestos al interactuar.</small></span><input type="checkbox" checked={appearance.calm} onChange={event => onAppearance({...appearance,calm:event.target.checked})} /></label>
          <VoiceSettings />
        </>}
      </div>
      <div className="appearance-footer"><span aria-live="polite">{chosen.name} + {THEMES.find(t => t.id === appearance.theme)?.name}<small>Guardado en este navegador</small></span><button className="appearance-done" onClick={() => dialog.current?.close()}>Listo, a charlar <span>↗</span></button></div>
    </dialog>
  );
}
