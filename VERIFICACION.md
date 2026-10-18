# Verificación de AstroPocket — 17/10/2026

Historia verificada: escribir a Nova → API local → Claude con herramientas de cálculo → lectura transmitida y resultados en el cronoscopio. Las pruebas de esta revisión se hicieron en otra instancia local para conservar el historial y las posiciones natales del usuario.

- `npm test`: 18 pruebas aprobadas, sin llamadas pagas. Incluyen geometría de aspectos, búsqueda de contactos, Swiss Ephemeris, horario histórico, hora desconocida y búsqueda local de ciudades.
- `npm run build`: TypeScript y Vite aprobados. Bundle principal de 442 kB (138 kB gzip).
- Dos conversaciones reales con Claude: lectura actual y exploración del 15/01/2027 con una carta natal calculada de ejemplo. `skyAtDate` ejecutada y casas natales incluidas en el contexto de la segunda lectura.
- Scroll durante transmisión: permaneció en 3 px mientras el contenido creció de 606 a 2239 px; en la segunda lectura permaneció en 2225 px mientras el contenido creció de 2837 a 3642 px. La pregunta queda anclada; el lector decide cuándo ir al final.
- Lectura: fuente de 16–17 px, párrafos espaciados, tablas Markdown, metadatos en un desplegable, compositor visible y textarea que crece hasta 144 px. El efecto CRT se conserva en Nova y no se superpone al texto.
- Vistas de 322×572, 390×844 y 1440×960 comprobadas sin desborde horizontal. Nova se compacta durante la conversación en la ventana pequeña. El tamaño de prueba se restaura al terminar.
- Nova: doble clic y botón explícito para alternar modo Solo, misma conversación y borrador, colección de cuatro diseños originales, selección de Mimo y microinteracciones conservadas. Las tarjetas de colección mantienen sus retratos grandes también con una charla activa.
- Natal: formulario completo probado con datos ficticios (01/01/2000, 12:00, Buenos Aires), búsqueda de ciudad local, Ascendente y doce casas calculadas. Sin hora conocida no se inventan Ascendente ni casas. Se rechazan horas locales ambiguas o inexistentes.
- Motor: Swiss Ephemeris 2.10.03 con archivos locales derivados de DE441, verificaciones SHA256 y rechazo del fallback silencioso a Moshier. UI, conversación y búsqueda usan el mismo motor.
- Comparación externa reproducible: 60 posiciones de Júpiter a Plutón publicadas en las tablas JPL DE431 de Astro-Seek para los primeros días de los doce meses de 2026 a las 12:00 UT. Diferencia máxima de 0,2083 segundos de arco respecto de sus valores publicados con cuatro decimales. Fixture: `tests/astro-seek-reference.json`. Esto verifica esas posiciones, no todas las funciones de Astro-Seek ni las interpretaciones.
- Atlas: 34.166 ciudades de GeoNames cities15000, coordenadas y zonas IANA disponibles localmente. Fuente, atribución y huella en `data/geonames/manifest.json`.
- Credencial: configurada en el servidor y ausente en `dist`; `/.env.local` devuelve 403. La instancia de pruebas no registró errores ni advertencias del navegador después de la recarga.
- Instancia final: `npm start` en 127.0.0.1:4173, estado configurado y Swiss Ephemeris 2.10.03 activo. `/api/sky` devuelve diez planetas. Conversación original y lente helenística conservadas después de recargar; texto de Nova a 16 px, compositor visible y consola del navegador sin errores. Se cerraron la instancia y las pestañas de pruebas y se restauró el viewport normal.

Fuentes, atribuciones y condiciones de distribución en `FUENTES-Y-LICENCIAS.md`. Límites de datos y cálculos en `README.md`. Captura actual: `artifacts/astropocket-conversacion.png`.
