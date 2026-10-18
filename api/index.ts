import type { IncomingMessage, ServerResponse } from "node:http";
import { createApiMiddleware } from "../server/api";
const handle=createApiMiddleware(process.cwd(),{remote:true});
export default async function handler(request:IncomingMessage,response:ServerResponse) {
  const url=new URL(request.url||"/","https://astropocket.local");
  if(url.pathname==="/api"||url.pathname==="/api/index") {
    const route=url.searchParams.get("path")||"";
    url.searchParams.delete("path");
    request.url="/api/"+route+(url.search?url.search:"");
  }
  const handled=await handle(request,response);
  if(!handled){response.writeHead(404);response.end();}
}
