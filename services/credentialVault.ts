type SavedConnection = { kind: "local" } | { kind: "key"; key: string };
type StoredConnection = { kind: "local" } | { kind: "key"; iv: Uint8Array; ciphertext: ArrayBuffer };
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open("astropocket-connection-v1",1);
    request.onupgradeneeded = () => request.result.createObjectStore("vault");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function read<T>(db:IDBDatabase,id:string):Promise<T|undefined> {
  return new Promise((resolve,reject) => {const r=db.transaction("vault").objectStore("vault").get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
async function write(db:IDBDatabase,values:Record<string,unknown>) {
  return new Promise<void>((resolve,reject) => {const t=db.transaction("vault","readwrite");for(const [id,value] of Object.entries(values))t.objectStore("vault").put(value,id);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});
}
/** Encrypt the remembered credential with a non-extractable, origin-local key. */
export async function rememberConnection(connection:SavedConnection) {
  const db=await database();
  try {
    if(connection.kind==="local") {await write(db,{connection});return;}
    const key = await read<CryptoKey>(db,"crypto-key") || await crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(connection.key));
    await write(db,{"crypto-key":key,connection:{kind:"key",iv,ciphertext} satisfies StoredConnection});
  } finally {db.close();}
}
export async function recallConnection():Promise<SavedConnection|null> {
  const db=await database();
  try {
    const saved=await read<StoredConnection>(db,"connection");
    if(!saved)return null;
    if(saved.kind==="local")return saved;
    const key=await read<CryptoKey>(db,"crypto-key");
    if(!key)return null;
    const plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv:saved.iv as Uint8Array<ArrayBuffer>},key,saved.ciphertext);
    return {kind:"key",key:new TextDecoder().decode(plaintext)};
  } finally {db.close();}
}
export async function forgetConnection() {
  const db=await database();
  try {await new Promise<void>((resolve,reject)=>{const t=db.transaction("vault","readwrite");t.objectStore("vault").clear();t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});} finally {db.close();}
}
