# Verificación de AstroPocket — 18/10/2026

Demo pública: https://astropocket.vercel.app . Código: https://github.com/pat031-prog/astropocket . Publicación AGPL-3.0 o posterior autorizada por el titular. Código de la versión alojada: `2fcd382`; despliegue `dpl_3xDNSmuWWXrn4j7fhyux2jZYfqPn`, promovido al dominio de producción.

## Flujo comprobado en Vercel

- Entrada pública pide una clave del visitante. Clave inválida rechazada; conexión válida aceptada; recargar recupera la conexión sin pedir de nuevo la clave. La carta inicial se identifica como ejemplo. El dueño no aporta una clave compartida.
- Conversación real desde el navegador: pedido anual sobre la carta de ejemplo → búsqueda con el motor → tres tránsitos con fechas y lectura simbólica completa en el mismo turno. No terminó en una promesa de buscar. El turno dejó de estar ocupado y mostró Escuchar lectura.
- API real: `/api/status` devolvió JSON, demo activa y conexión sin configurar para una petición anónima. `/api/places` encontró Buenos Aires. Nacimiento ficticio 01/01/2000 a las 12:00: doce casas, Sol en Capricornio. `/api/sky`: diez planetas con Swiss Ephemeris. `/.env.local`: 404.
- Voz neuronal de Kokoro desde la función: Dora devolvió WAV válido de 129.644 bytes en 11,392 s en la primera prueba alojada; Alex, 146.444 bytes en 9,263 s. Son mediciones de esas frases y ese momento, no una garantía de latencia. Las lecturas largas se sintetizan por frases y pueden esperar entre segmentos.
- Navegador: lectura en voz avanzó al 17%; pausar cambió a Lectura en pausa; reanudar a Nova en voz; detener retiró el reproductor. No se usa la voz robótica de SpeechSynthesis. El texto seleccionado se envía a AstroPocket para sintetizarlo, sin otro proveedor de audio.
- Escritorio 1280×720: altura total 720 px, sin desborde horizontal, compositor dentro de la pantalla. Teléfono 390×844: ancho 390 px y compositor visible. Taller a 322×572: diálogo de 304 px sin desborde. Se restauró el tamaño normal.
- Cinco formas: Nova original, Mimo (Tamagotchi), Volt (Pokémon), Seraf (ángel bíblico) y Nulo. Tres temas: Nebulosa, Jardín LCD y Observatorio. El taller permite probar sin cerrarse en cada selección. Modo sólo Nova activado y vuelto a consola en producción.
- El dominio de producción es público; los enlaces generados de despliegue conservan la protección estándar de Vercel. No se desactivó la protección del proyecto.
- Mail enviado desde Chrome/Gmail a la dirección indicada por el usuario con el dominio público y el código. Gmail confirmó Se envió el mensaje; se abrió el mensaje enviado.

## Comprobaciones reproducibles

- `npm test`: 26 pruebas aprobadas. Geometría, retrogradación, efemérides Swiss, fecha y hora histórica, hora desconocida, atlas, cierre real tras herramientas, cancelación, aislamiento de claves por visitante, bóveda cifrada y limpieza de texto para voz. Sin llamadas pagas en los tests.
- `npm run build`: TypeScript y Vite aprobados. JS principal 470,00 kB, 147,67 kB gzip. Compilación ESM nativa de la API comprobada además de la prueba alojada.
- 60 posiciones de Júpiter a Plutón, primeros días de cada mes de 2026 a las 12:00 UT, contrastadas con tablas DE431 de Astro-Seek. Diferencia máxima: 0,2083 segundos de arco respecto de sus cifras de cuatro decimales. No certifica otras épocas, casas ni interpretaciones.
- Swiss Ephemeris 2.10.03 / datos DE441 con hashes SHA-256 y rechazo de fallback silencioso a Moshier. Atlas GeoNames de 34.166 lugares. Datos y fuentes en `FUENTES-Y-LICENCIAS.md`.
- Escaneo de fuente y build sin claves reales ni el perfil personal anterior. `.env.local`, respaldos privados, capturas, audios de prueba, ZIP y configuración local de Vercel quedan ignorados. La carta y el historial existentes de la consola local se conservan en su origen.

Evidencia local, excluida de Git: `artifacts/astropocket-publicado-novas.png`, `astropocket-voz-publicada.png`, `astropocket-mobile-taller.png`, `astropocket-demo-entrada.png`, `mail-link-enviado.png` y muestras WAV de ambas voces. El motor puede emitir una advertencia de ONNX Runtime sobre un identificador de telemetría que no puede persistir en el sistema de archivos de Vercel; las respuestas de audio comprobadas fueron correctas.

## Revisión móvil posterior

- `npm test`: 30 pruebas aprobadas. Se agregaron traslado de nacimiento sin credenciales/historial, rechazo de enlaces inválidos y selección explícita entre nodo medio y verdadero, conservando el resultado de cartas antiguas.
- `npm run build`: TypeScript y Vite aprobados; JS principal 474,60 kB / 149,26 kB gzip. La validación del enlace no agrega una biblioteca al cliente.
- Chrome, viewport aproximado de 414×736: selección de los tres temas mediante tarjetas y radios, sin desborde horizontal. Con altura de 450 px, compositor visible dentro de los límites y texto de entrada de 16 px. También se seleccionó tema en horizontal, aproximadamente 896×414. Son pruebas de dimensiones en escritorio; no sustituyen probar Safari en un iPhone físico ni su teclado real.
- Se contrastó una carta solicitada por su titular con la calculadora de Astro-Seek: diez planetas, nodo medio, Ascendente, Medio Cielo y once casas planetarias coincidieron al minuto mostrado. Se usaron las mismas coordenadas de ciudad redondeadas al minuto de arco y Placidus. Los datos y la evidencia del caso personal se excluyen de Git y del despliegue.
- El enlace con nacimiento precargado abre el formulario incluso cuando Carta está oculto en móvil. Calcular guarda las posiciones, elimina el fragmento de la barra y conserva mensajes. El enlace se puede copiar desde Carta para otro dispositivo; no es sincronización automática.
- Cambios de interfaz revisados por accesibilidad, dependencias de hooks y limpieza de listeners/RAF; no se bloquea el zoom manual.
