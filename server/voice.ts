import * as ort from "onnxruntime-node";
import createEphone, { roa } from "ephone";

const BASE="https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/";
let engine:Promise<{session:ort.InferenceSession;vocab:Record<string,number>;phonemes:Awaited<ReturnType<typeof createEphone>>}>|null=null;
const voices=new Map<string,Float32Array>();
async function resource(file:string){
  const response=await fetch(BASE+file,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw new Error("No se pudo descargar el modelo de voz.");
  return response.arrayBuffer();
}
function load(){
  if(!engine)engine=(async()=>{
    const [model,tokenizer,phonemes]=await Promise.all([resource("onnx/model_quantized.onnx"),resource("tokenizer.json"),createEphone(roa)]);
    phonemes.setVoice("es-419");
    const session=await ort.InferenceSession.create(new Uint8Array(model),{executionProviders:["cpu"],intraOpNumThreads:2,interOpNumThreads:1,graphOptimizationLevel:"all"});
    return{session,vocab:JSON.parse(new TextDecoder().decode(tokenizer)).model.vocab as Record<string,number>,phonemes};
  })().catch(error=>{engine=null;throw error;});
  return engine;
}
export function encodeWav(samples:Float32Array){
  if(!samples.length||samples.length>24000*90||!samples.every(Number.isFinite))throw new Error("La voz generó un audio inválido.");
  const data=Buffer.alloc(44+samples.length*2);
  data.write("RIFF",0);data.writeUInt32LE(data.length-8,4);data.write("WAVE",8);data.write("fmt ",12);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(24000,24);data.writeUInt32LE(48000,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write("data",36);data.writeUInt32LE(samples.length*2,40);
  for(let i=0;i<samples.length;i++){const sample=Math.max(-1,Math.min(1,samples[i]));data.writeInt16LE(Math.round(sample*(sample<0?32768:32767)),44+i*2);}
  return data;
}
export async function synthesize(text:string,voice:"ef_dora"|"em_alex"){
  const {session,vocab,phonemes}=await load();
  const phones=phonemes.textToIpa(text).replace(/\(\([^)]*\)\)/g,"");
  const tokens=Array.from(phones).map(char=>vocab[char]).filter(value=>value!==undefined);
  if(!tokens.length||tokens.length>500)throw new Error("La frase es demasiado larga para la voz.");
  if(!voices.has(voice))voices.set(voice,new Float32Array(await resource(`voices/${voice}.bin`)));
  const ids=BigInt64Array.from([0,...tokens,0],BigInt);
  const offset=Math.min(tokens.length,509)*256;
  const output=await session.run({input_ids:new ort.Tensor("int64",ids,[1,ids.length]),style:new ort.Tensor("float32",voices.get(voice)!.slice(offset,offset+256),[1,256]),speed:new ort.Tensor("float32",Float32Array.of(1),[1])});
  return encodeWav(output.waveform.data as Float32Array);
}
