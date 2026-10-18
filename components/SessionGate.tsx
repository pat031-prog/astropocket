import React, { useEffect, useState } from "react";
import { connectSession, setSessionKey } from "../services/session";
import { getConnection, type ConnectionStatus } from "../services/terminalApi";
import { restoreAppearance } from "../services/appearance";
import NovaShell from "./NovaShell";
import { recallConnection } from "../services/credentialVault";

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState("");
  const [appearance] = useState(restoreAppearance);
  useEffect(() => {
    let mounted=true;
    void (async()=>{
      try {
        const state=await getConnection();
        if(!mounted)return;
        setStatus(state);
        const saved=await recallConnection().catch(()=>null);
        if(!saved || (saved.kind==="local"&&!state.localAvailable))return;
        await connectSession(saved.kind==="key"?saved.key:"",saved.kind==="local",true);
        if(mounted)setConnected(true);
      } catch { if(mounted)setError("No pudimos recuperar la conexión. Podés conectar tu clave otra vez."); }
      finally {if(mounted)setLoading(false);}
    })();
    const close = () => { setSessionKey(""); setConnected(false); setKey(""); setError(""); };
    window.addEventListener("astropocket:disconnect", close);
    return () => {mounted=false;window.removeEventListener("astropocket:disconnect", close);};
  }, []);
  async function connect(local = false) {
    setBusy(true); setError("");
    try { const result=await connectSession(local ? "" : key.trim(), local,remember); if(remember&&!result.remembered)setNotice("Conectado. Este navegador no pudo recordar la clave; seguirá activa durante esta sesión.");setKey(""); setConnected(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo conectar."); }
    finally { setBusy(false); }
  }
  if (connected) return <>{children}{notice&&<div className="console-toast" role="status">{notice}</div>}</>;
  if (loading) return <div className="astropocket gate-loading" data-theme={appearance.theme}><span className="nova-robot"><NovaShell /></span><p>Retomando la señal…</p></div>;
  return <div className="astropocket session-gate" data-theme={appearance.theme} data-calm={appearance.calm}>
    <header className="gate-brand"><span>✳</span> ASTROPOCKET <small>DEMO / PERSONAL ORBIT SYSTEM</small></header>
    <main className="gate-layout">
      <div className="gate-world">
        <span className="gate-coordinate">SEÑAL ENCONTRADA / UNIT—09</span>
        <div className="gate-nova"><span className="exhibit-orbit" /><span className="nova-robot"><NovaShell /></span></div>
        <h1>Hay algo moviéndose<br />ahí arriba.</h1>
        <p>Tu carta, el cielo y una conversación<br />con alguien que sabe mirar.</p>
      </div>
      <form className="gate-form" onSubmit={event => {event.preventDefault(); void connect();}}>
        <span className="gate-eyebrow">TU ENTRADA A LA CONSOLA</span>
        <h2>Conectá con Nova.</h2>
        <p>Para esta demo usamos Claude, de Anthropic. Entrá con tu propia clave para conversar.</p>
        <div className="gate-provider"><span>✳</span><div><strong>Anthropic</strong><small>Claude Sonnet 5.5</small></div><span>ACTIVO</span></div>
        <label htmlFor="demo-key">Tu clave API de Anthropic</label>
        <input id="demo-key" type="password" autoComplete="off" spellCheck={false} required={!busy} minLength={20} maxLength={300} placeholder="sk-ant-…" value={key} onChange={event => setKey(event.target.value)} disabled={busy} aria-describedby="key-privacy" />
        <p className="key-privacy" id="key-privacy">Este servidor usa tu clave para consultar Anthropic y no la guarda. Las consultas consumen tu saldo de API.</p>
        <label className="remember-key"><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)} /><span>Recordar en este navegador<small>Guardada cifrada y separada de tus conversaciones.</small></span></label>
        {error && <p className="gate-error" role="alert">{error}</p>}
        <button className="gate-connect" disabled={loading || busy || key.trim().length < 20}>{loading?"Recuperando conexión…":busy ? "Comprobando conexión…" : "Entrar a AstroPocket"}<span>↗</span></button>
        {status?.localAvailable && <button type="button" className="gate-local" disabled={busy||loading} onClick={() => void connect(true)}>Usar la conexión local de esta PC <span>↗</span></button>}
        <a className="gate-key-link" href="https://platform.claude.com/settings/keys" target="_blank" rel="noreferrer">Obtener una clave en Anthropic ↗</a>
        <div className="gate-footnote"><span>☉ Efemérides reales</span><span>◈ Memoria en tu navegador</span></div>
      </form>
    </main>
    <footer className="gate-bottom">LAS ESTRELLAS INCLINAN. VOS DECIDÍS. <a href="https://github.com/pat031-prog/astropocket" target="_blank" rel="noreferrer">Código fuente · AGPL ↗</a></footer>
  </div>;
}
