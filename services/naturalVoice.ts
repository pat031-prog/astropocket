import {sessionHeaders} from "./session";
export const NATURAL_VOICES=[{id:"ef_dora",name:"Dora · suave"},{id:"em_alex",name:"Alex · grave"}] as const;
export type NaturalVoice=(typeof NATURAL_VOICES)[number]["id"];
export function preferredVoice():NaturalVoice{try{return localStorage.getItem("astropocket.voice")==="em_alex"?"em_alex":"ef_dora";}catch{return"ef_dora";}}
export async function naturalSpeech(text:string,voice:NaturalVoice,signal:AbortSignal,progress:(label:string)=>void){
  progress("Preparando voz natural…");
  const response=await fetch("/api/voice",{method:"POST",headers:{"Content-Type":"application/json",...sessionHeaders()},body:JSON.stringify({text,voice}),signal});
  if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||"No se pudo preparar la voz natural.");}
  return response.arrayBuffer();
}
