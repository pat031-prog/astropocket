import {useEffect,useRef,useState} from "react";
import {speechChunks,spokenText} from "../services/speech";
import {naturalSpeech,preferredVoice} from "../services/naturalVoice";
type Playback={id:string;state:"starting"|"playing"|"paused"|"error";progress:number;label?:string;error?:string};
export default function useVoiceReader(){
  const supported=typeof window!=="undefined"&&"Worker"in window&&"WebAssembly"in window;
  const [playback,setPlayback]=useState<Playback|null>(null);
  const request=useRef<AbortController|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null);
  const url=useRef("");
  function clearAudio(){if(audio.current){audio.current.pause();audio.current.onended=null;audio.current.onerror=null;audio.current=null;}if(url.current){URL.revokeObjectURL(url.current);url.current="";}}
  const stop=()=>{request.current?.abort();request.current=null;clearAudio();setPlayback(null);};
  useEffect(()=>()=>{request.current?.abort();clearAudio();},[]);
  const read=async(id:string,markdown:string)=>{
    if(!supported)return;
    request.current?.abort();clearAudio();
    const controller=new AbortController();request.current=controller;
    const text=spokenText(markdown);
    const first=speechChunks(text,85)[0];
    const chunks=first?[first,...speechChunks(text.slice(first.length).trim(),190)]:[];
    const voice=preferredVoice();
    if(!chunks.length)return;
    let index=0;
    setPlayback({id,state:"starting",progress:0,label:"Preparando voz natural…"});
    // Prepare the next phrase while the current one plays. Only one phrase is prefetched.
    let next=naturalSpeech(chunks[0],voice,controller.signal,label=>{if(!controller.signal.aborted)setPlayback({id,state:"starting",progress:0,label});});
    try{
      while(index<chunks.length){
        const bytes=await next;if(controller.signal.aborted)return;
        clearAudio();url.current=URL.createObjectURL(new Blob([bytes],{type:"audio/wav"}));
        const player=new Audio(url.current);audio.current=player;const phrase=index;
        const finished=new Promise<void>((resolve,reject)=>{const abort=()=>resolve();controller.signal.addEventListener("abort",abort,{once:true});player.onended=()=>{controller.signal.removeEventListener("abort",abort);resolve();};player.onerror=()=>{controller.signal.removeEventListener("abort",abort);reject(new Error("No se pudo reproducir la lectura."));};});
        player.ontimeupdate=()=>{if(!controller.signal.aborted)setPlayback(p=>p&&p.id===id?{...p,progress:(phrase+(player.duration?player.currentTime/player.duration:0))/chunks.length}:p);};
        try{await player.play();setPlayback({id,state:"playing",progress:index/chunks.length});}
        catch(error){if(error instanceof DOMException&&error.name==="NotAllowedError")setPlayback({id,state:"paused",progress:index/chunks.length});else throw error;}
        index++;
        if(index<chunks.length){next=naturalSpeech(chunks[index],voice,controller.signal,()=>{});void next.catch(()=>{});}
        await finished;if(controller.signal.aborted)return;
        if(index<chunks.length)setPlayback({id,state:"starting",progress:index/chunks.length,label:"Preparando la próxima frase…"});
      }
      clearAudio();setPlayback(null);
    }catch(error){if(!controller.signal.aborted)setPlayback({id,state:"error",progress:index/chunks.length,error:error instanceof Error?error.message:"No se pudo reproducir la voz natural."});}
  };
  const toggle=()=>{
    const player=audio.current;if(!player||!playback)return;
    if(player.paused){void player.play().then(()=>setPlayback(p=>p?{...p,state:"playing"}:p)).catch(()=>setPlayback(p=>p?{...p,state:"error",error:"Tocá Escuchar para volver a iniciar el audio."}:p));}
    else{player.pause();setPlayback(p=>p?{...p,state:"paused"}:p);}
  };
  return{supported,playback,read,stop,toggle};
}
