import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { rememberConnection,recallConnection,forgetConnection } from "../services/credentialVault";
test("recordar una clave conserva sólo texto cifrado, permite recuperarla y la elimina al desconectar",async()=>{
  const secret="sk-ant-test-only-never-a-real-key";
  await rememberConnection({kind:"key",key:secret});
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("astropocket-connection-v1");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const values=await new Promise<unknown[]>((resolve,reject)=>{const r=db.transaction("vault").objectStore("vault").getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  db.close();
  assert.ok(!JSON.stringify(values).includes(secret));
  const key=values.find(v=>v instanceof CryptoKey) as CryptoKey;
  assert.equal(key.extractable,false);
  assert.deepEqual(await recallConnection(),{kind:"key",key:secret});
  await forgetConnection();assert.equal(await recallConnection(),null);
  await rememberConnection({kind:"local"});assert.deepEqual(await recallConnection(),{kind:"local"});
  await forgetConnection();
});
