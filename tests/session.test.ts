import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import type { AddressInfo } from "node:net";
import { createApiMiddleware } from "../server/api";

test("el modo público nunca usa la clave del dueño y valida por visitante",async()=>{
  const seen:string[]=[];
  const middleware=createApiMiddleware(process.cwd(),{remote:true,env:{ANTHROPIC_API_KEY:"sk-ant-owner-must-never-be-used",ANTHROPIC_MODEL:"claude-sonnet-5-5"},fetch:(async(_url,options)=>{
    const key=new Headers(options?.headers).get("x-api-key")!;seen.push(key);
    return new Response("{}",{status:key==="sk-ant-rejected-visitor-key"?401:200});
  }) as typeof fetch});
  const server=createServer((req,res)=>void middleware(req,res));
  await new Promise<void>(r=>server.listen(0,"127.0.0.1",r));
  const base=`http://127.0.0.1:${(server.address()as AddressInfo).port}`;
  try {
    const state=await(await fetch(base+"/api/status")).json();
    assert.equal(state.demo,true);assert.equal(state.configured,false);assert.equal(state.localAvailable,false);
    assert.equal((await fetch(base+"/api/session",{method:"POST",headers:{"Content-Type":"application/json"},body:'{"useLocal":true}'})).status,401);
    const connect=(key:string)=>fetch(base+"/api/session",{method:"POST",headers:{"Content-Type":"application/json","x-astropocket-key":key},body:"{}"});
    assert.equal((await connect("sk-ant-first-visitor-key")).status,200);
    assert.equal((await connect("sk-ant-second-visitor-key")).status,200);
    assert.equal((await connect("sk-ant-rejected-visitor-key")).status,401);
    assert.deepEqual(seen,["sk-ant-first-visitor-key","sk-ant-second-visitor-key","sk-ant-rejected-visitor-key"]);
    assert.equal((await fetch(base+"/api/config",{method:"POST"})).status,405);
    const body={messages:[{role:"user",content:"Hola"}],natal:{Sol:{sign:"Aries",deg:0}},profileName:"Demo",date:"2026-10-18T12:00:00-03:00",mode:"MODERN"};
    assert.equal((await fetch(base+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})).status,401);
    assert.equal((await fetch(base+"/api/status",{headers:{Origin:"https://external.example"}})).status,403);
    assert.ok(!JSON.stringify(state).includes("sk-ant-"));
  } finally {await new Promise<void>(r=>server.close(()=>r()));}
});
