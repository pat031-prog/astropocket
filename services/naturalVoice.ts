export const NATURAL_VOICES=[{id:"ef_dora",name:"Dora · suave"},{id:"em_alex",name:"Alex · grave"}] as const;
export type NaturalVoice=(typeof NATURAL_VOICES)[number]["id"];
export function preferredVoice():NaturalVoice{try{return localStorage.getItem("astropocket.voice")==="em_alex"?"em_alex":"ef_dora";}catch{return"ef_dora";}}
let worker:Worker|null=null;
let serial=0;
const waiting=new Map<number,{resolve:(audio:ArrayBuffer)=>void;reject:(error:Error)=>void;progress:(label:string)=>void;cleanup:()=>void}>();
export function naturalSpeech(text:string,voice:NaturalVoice,signal:AbortSignal,progress:(label:string)=>void){
  if(!worker){
    worker=new Worker(new URL("./naturalVoice.worker.ts",import.meta.url),{type:"module"});
    worker.onmessage=event=>{
      const data=event.data;const request=waiting.get(data.id);if(!request)return;
      if(data.type==="loading")request.progress(data.percent===null?"Descargando voz natural…":`Descargando voz natural · ${data.percent}%`);
      else if(data.type==="preparing")request.progress(data.label||"Preparando voz natural…");
      else{request.cleanup();waiting.delete(data.id);if(data.type==="audio")request.resolve(data.audio);else request.reject(new Error(data.error));}
    };
    worker.onerror=()=>{for(const request of waiting.values()){request.cleanup();request.reject(new Error("No se pudo iniciar la voz natural en este navegador."));}waiting.clear();worker?.terminate();worker=null;};
  }
  return new Promise<ArrayBuffer>((resolve,reject)=>{
    if(signal.aborted){reject(new DOMException("Lectura detenida","AbortError"));return;}
    const id=++serial;
    const abort=()=>{waiting.delete(id);reject(new DOMException("Lectura detenida","AbortError"));if(!waiting.size){worker?.terminate();worker=null;}};
    signal.addEventListener("abort",abort,{once:true});
    waiting.set(id,{resolve,reject,progress,cleanup:()=>signal.removeEventListener("abort",abort)});
    worker!.postMessage({id,text,voice});
  });
}
