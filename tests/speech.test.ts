import { test } from "node:test";
import assert from "node:assert/strict";
import { spokenText,speechChunks } from "../services/speech";
test("la lectura hablada conserva contenido y grados sin pronunciar sintaxis Markdown ni URLs",()=>{
  const text=spokenText("## Tu lectura\n**Saturno** a 8° de Aries. [Más datos](https://example.com)\n\nNo anuncia hechos.");
  assert.match(text,/Saturno a 8 grados de Aries/);assert.match(text,/Más datos/);assert.ok(!/https|\*|##/.test(text));
});
test("una lectura larga se reparte en frases sin perder palabras ni cortar números decimales",()=>{
  const text=("El orbe es de 2.45 grados. Esta es una frase para leer con calma. ").repeat(50).trim();
  const chunks=speechChunks(text);
  assert.ok(chunks.length>1);assert.ok(chunks.every(x=>x.length<=350));assert.equal(chunks.join(" "),text);
});
