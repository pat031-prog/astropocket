import * as ort from "onnxruntime-web/wasm";
import createEphone, { roa } from "ephone";

// Kokoro-82M, Apache-2.0. Pin the published model revision for reproducible voices.
const BASE="https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/";
ort.env.wasm.numThreads=self.crossOriginIsolated?Math.min(4,self.navigator.hardwareConcurrency||2):1;
ort.env.wasm.wasmPaths="/voice-runtime/1.30.0/";
let model:Promise<{session:ort.InferenceSession;vocab:Record<string,number>}>|null=null;
const styles=new Map<string,Float32Array>();
const phonemes=createEphone(roa).then(engine=>{engine.setVoice("es-419");return engine;});
type Request={id:number;text:string;voice:"ef_dora"|"em_alex"};
const send=(value:unknown)=>self.postMessage(value);
async function resource(file:string,id:number){
  const url=BASE+file;
  let cache:Cache|undefined;
  try{cache=await caches.open("astropocket-kokoro-v1");const saved=await cache.match(url);if(saved)return saved.arrayBuffer();}catch{/* Cache is optional. */}
  const response=await fetch(url,{credentials:"omit"});
  if(!response.ok)throw new Error("No se pudo descargar la voz.");
  const total=Number(response.headers.get("content-length"))||0;
  const reader=response.body?.getReader();
  let data:ArrayBuffer;
  if(reader){
    const chunks:Uint8Array[]=[];let loaded=0;
    for(;;){const {value,done}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;if(file.endsWith(".onnx"))send({id,type:"loading",percent:total?Math.min(99,Math.round(loaded/total*100)):null});}
    const bytes=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}data=bytes.buffer;
  }else data=await response.arrayBuffer();
  try{await cache?.put(url,new Response(data));}catch{/* Continue without persistence. */}
  return data;
}
async function engine(id:number){
  if(!model)model=(async()=>{
    send({id,type:"loading",percent:0});
    const [weights,tokenizer]=await Promise.all([resource("onnx/model_quantized.onnx",id),resource("tokenizer.json",id)]);
    send({id,type:"preparing",label:"Abriendo el motor de voz…"});
    const session=await ort.InferenceSession.create(weights,{executionProviders:["wasm"],graphOptimizationLevel:"all"});
    const vocab=JSON.parse(new TextDecoder().decode(tokenizer)).model.vocab as Record<string,number>;
    return{session,vocab};
  })().catch(error=>{model=null;throw error;});
  return model;
}
function wav(samples:Float32Array){
  const data=new ArrayBuffer(44+samples.length*2);const view=new DataView(data);
  const text=(at:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(at+i,value.charCodeAt(i));};
  text(0,"RIFF");view.setUint32(4,data.byteLength-8,true);text(8,"WAVE");text(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,24000,true);view.setUint32(28,48000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,"data");view.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++){const sample=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,Math.round(sample*(sample<0?32768:32767)),true);}
  return data;
}
async function synthesize({id,text,voice}:Request){
  const {session,vocab}=await engine(id);
  send({id,type:"preparing",label:"Preparando pronunciación…"});
  // eSpeak supplies phonemes only; Kokoro generates the audible, neural waveform.
  const phones=(await phonemes).textToIpa(text).replace(/\(\([^)]*\)\)/g,"");
  const tokens=Array.from(phones).map(char=>vocab[char]).filter(value=>value!==undefined);
  if(tokens.length>500)throw new Error("La frase es demasiado larga para la voz.");
  const ids=BigInt64Array.from([0,...tokens,0],BigInt);
  if(!styles.has(voice))styles.set(voice,new Float32Array(await resource(`voices/${voice}.bin`,id)));
  const offset=Math.min(tokens.length,509)*256;
  const style=styles.get(voice)!.slice(offset,offset+256);
  send({id,type:"preparing",label:"Generando la primera frase…"});
  const output=await session.run({input_ids:new ort.Tensor("int64",ids,[1,ids.length]),style:new ort.Tensor("float32",style,[1,256]),speed:new ort.Tensor("float32",Float32Array.of(1),[1])});
  const samples=output.waveform.data as Float32Array;
  const audio=wav(samples);
  self.postMessage({id,type:"audio",audio}, {transfer:[audio]});
}
let queue=Promise.resolve();
self.onmessage=(event:MessageEvent<Request>)=>{
  const request=event.data;
  queue=queue.then(()=>synthesize(request)).catch(()=>send({id:request.id,type:"error",error:"No se pudo preparar la voz natural. Revisá la conexión y volvé a intentar."}));
};
