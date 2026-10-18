import React, { useRef, useState } from "react";
import type { ConnectionStatus } from "../services/terminalApi";
import { connectSession, disconnectSession } from "../services/session";
export default function ConnectionDialog({status,onSaved}:{status:ConnectionStatus|null;onSaved:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [key,setKey]=useState("");const [remember,setRemember]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  return <>
    <button className="connection-button" aria-label="Conexión de IA" onClick={()=>{setError("");dialog.current?.showModal();}}><span className={status?.configured?"status-dot ready":"status-dot"} /><span className="connection-label">CONEXIÓN </span>IA</button>
    <dialog ref={dialog} className="console-dialog connection-dialog" aria-labelledby="connection-title" onClose={()=>setKey("")}>
      <div className="module-heading"><span id="connection-title">CONEXIÓN / ANTHROPIC</span><button type="button" aria-label="Cerrar conexión" onClick={()=>dialog.current?.close()}>×</button></div>
      <form className="dialog-content" onSubmit={async event=>{event.preventDefault();setBusy(true);setError("");try{const result=await connectSession(key.trim(),false,remember);setKey("");onSaved();if(remember&&!result.remembered)setError("La conexión está activa, pero el navegador no pudo recordarla.");else dialog.current?.close();}catch(e){setError(e instanceof Error?e.message:"No se pudo conectar.");}finally{setBusy(false);}}}>
        <div className="connection-state"><span className="status-dot ready" />Claude Sonnet 5.5 · Anthropic</div>
        <p>La conversación usa tu clave y tu saldo de Anthropic. Podés cambiar la conexión sin perder tu carta ni tus mensajes.</p>
        <label>Nueva clave de Anthropic<input type="password" autoComplete="off" spellCheck={false} placeholder="sk-ant-…" value={key} onChange={e=>setKey(e.target.value)} minLength={20} maxLength={300} required /></label>
        <label className="remember-key"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /><span>Recordar en este navegador<small>Guardada cifrada, separada del historial.</small></span></label>
        {error&&<p role="alert" className="inline-error">{error}</p>}
        <button className="primary-button" disabled={busy||key.trim().length<20}>{busy?"COMPROBANDO…":"CONECTAR ESTA CLAVE →"}</button>
        <button type="button" className="disconnect-button" disabled={busy} onClick={()=>{dialog.current?.close();void disconnectSession();}}>Desconectar y olvidar la clave</button>
      </form>
    </dialog>
  </>;
}
