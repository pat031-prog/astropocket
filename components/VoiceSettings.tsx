import React,{useState}from"react";
import {NATURAL_VOICES,preferredVoice,type NaturalVoice}from"../services/naturalVoice";
export default function VoiceSettings(){
  const [voice,setVoice]=useState(preferredVoice);
  return <div className="voice-settings"><label htmlFor="reading-voice">La voz de tus lecturas</label><select id="reading-voice" value={voice} onChange={e=>{setVoice(e.target.value as NaturalVoice);try{localStorage.setItem("astropocket.voice",e.target.value);}catch{/* Preference is optional. */}}}><option value="ef_dora">{NATURAL_VOICES[0].name}</option><option value="em_alex">{NATURAL_VOICES[1].name}</option></select><p>Voces neuronales en español, generadas por AstroPocket. Al tocar Escuchar, el texto de esa lectura se envía al servidor para convertirlo en audio. No necesita otra clave. La primera escucha puede tardar mientras se prepara el motor.</p></div>;
}
