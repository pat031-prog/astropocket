# Fuentes y licencias

## Cálculos

- [Swiss Ephemeris](https://www.astro.com/swisseph/swisseph.htm), versión 2.10.03. Puente WASM: [@kuntay/swisseph](https://github.com/kuntayerkus/swisseph-wasm), versión 0.2.2. Datos `@kuntay/swisseph-data` 0.2.2: `sepl_18.se1`, `semo_18.se1`, `seas_18.se1`; se verifican los hashes contra el manifiesto del paquete antes de montar los archivos.
- Archivos derivados de DE441, cobertura del paquete 1800–2399. La aplicación limita las consultas a 1900–2100. No descarga datos durante una consulta: están instalados en esta PC.
- Referencia externa: [tablas JPL DE431 de Astro-Seek](https://horoscopes.astro-seek.com/jpl-de431-ephemeris-astrology-online-tables). El 17/10/2026 se consultaron las posiciones geocéntricas tropicales de las 12:00 UT del primer día de cada mes de 2026. Se guardaron 60 valores numéricos de los enlaces públicos de carta como fixtures. Diferencia máxima medida: 0,2083 segundos de arco frente a valores publicados con cuatro decimales. El contraste es acotado, no una certificación del sitio.
- También se consultaron su [índice de interpretaciones de tránsitos](https://horoscopes.astro-seek.com/transit-aspects-astrology-free-interpretations) y su [lectura de Saturno trígono Júpiter](https://horoscopes.astro-seek.com/transit-aspects/saturn-trine-jupiter-transit-aspect-meaning). No se copiaron ni descargaron sus textos como una base redistribuible. Nova conserva su interpretación contextual y distingue la lectura simbólica de los grados calculados.

Swiss Ephemeris y los paquetes instalados se distribuyen bajo AGPL-3.0 o posterior; la biblioteca original también ofrece licencia profesional. El titular autorizó publicar AstroPocket y su código bajo AGPL-3.0 o posterior el 18/10/2026. La licencia completa está en `LICENSE`; los avisos de los paquetes se conservan en `licenses/`. El código correspondiente se ofrece en [GitHub](https://github.com/pat031-prog/astropocket), enlazado desde la consola.

## Atlas de ciudades

Fuente: [GeoNames](https://www.geonames.org/export/), extracto público [cities15000.zip](https://download.geonames.org/export/dump/cities15000.zip), descargado el 17/10/2026. `data/geonames/cities.json` contiene 34.166 lugares con nombre, país, coordenadas y zona horaria. El ZIP y TXT de descarga quedan fuera del repositorio. No es un atlas de todas las localidades: se pueden ingresar coordenadas manualmente.

Datos bajo licencia CC BY, según las [condiciones de GeoNames](https://www.geonames.org/export/). Se da crédito en el formulario de nacimiento y aquí. No se usa su API ni se envía la búsqueda de ciudad a servicios externos.

Las zonas históricas se resuelven con `@js-temporal/polyfill` 0.5.1 e Intl/IANA del runtime. Se comprueba el cambio histórico de Argentina y el rechazo de horas ambiguas o inexistentes en pruebas. No se fuerza UTC−03 al nacimiento. El cronoscopio de tránsitos conserva su convención explícita de visualización UTC−03.

## Personajes

Nova conserva su forma original en CSS. Mimo es un homenaje visual al dispositivo Tamagotchi y su mascota LCD. Volt es un homenaje a Pokémon con criatura eléctrica, orejas y cola de rayo. Seraf combina alas, ruedas y ojos inspirados en el imaginario de ángeles bíblicos. Nulo es una criatura experimental flotante. Las ilustraciones SVG y las animaciones CSS se dibujaron para esta app; no se descargaron sprites, música ni archivos gráficos de las marcas. Los nombres de las referencias identifican los homenajes solicitados, sin afiliación oficial. La investigación de repositorios está en `IDENTIDAD-Y-REFERENCIAS.md`.

## Voz

[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0, voces españolas `ef_dora` y `em_alex`. Exportación ONNX de [onnx-community](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX), revisión fija `1939ad2a8e416c0acfeecc08a694d14ef25f2231`. Pesos públicos descargados a pedido; no se incluyen credenciales ni se envía el texto a Hugging Face. ONNX Runtime Web 1.30.0, MIT, ejecuta la red en WASM.

[ephone 1.0.2](https://github.com/sjmik/ephone-js), GPL-3.0 o posterior, deriva de [eSpeak NG](https://github.com/espeak-ng/espeak-ng). Se usa el paquete de idiomas romances y `es-419` para producir fonemas; el sonido audible lo genera Kokoro. Fuente y scripts de construcción del fonemizador en el repositorio citado. Los avisos se conservan en `licenses/`.
