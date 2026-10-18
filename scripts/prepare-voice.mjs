import{mkdir,copyFile,readdir}from"node:fs/promises";
import path from"node:path";
import{createRequire}from"node:module";
const require=createRequire(import.meta.url);
const runtime=path.dirname(require.resolve("onnxruntime-web"));
const target=path.resolve("public/voice-runtime/1.30.0");
await mkdir(target,{recursive:true});
for(const name of await readdir(runtime)){if(/^ort-wasm-simd-threaded\.(mjs|wasm)$/.test(name))await copyFile(path.join(runtime,name),path.join(target,name));}
