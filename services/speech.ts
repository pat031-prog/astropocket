export function spokenText(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g," ").replace(/!\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1")
    .replace(/https?:\/\/\S+/g,"").replace(/^\s{0,3}(?:#{1,6}|>|[-*+] |\d+\. )/gm,"")
    .replace(/[*_~`]/g,"").replace(/(\d)°/g,"$1 grados").replace(/\n{2,}/g,". ").replace(/\s+/g," ").trim();
}
export function speechChunks(text: string, limit=350) {
  const chunks:string[]=[];
  let current="";
  for(const sentence of text.split(/(?<=[.!?…])\s+/)) {
    for(const word of sentence.split(/\s+/)) {
      if(current.length+word.length+1>limit&&current) {chunks.push(current);current="";}
      current+=(current?" ":"")+word;
    }
    if(current.length>limit*.65) {chunks.push(current);current="";}
  }
  if(current)chunks.push(current);
  return chunks;
}
