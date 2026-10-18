# AstroPocket

Demo: https://astropocket.vercel.app

Consola personal de astrología con Nova / UNIT-09. Retoma la identidad de la v9.6: terminal violeta y cian, carta natal, instrumental del cielo y el robot original como compañero.

## Ejecutar en esta PC

Requiere Node.js 22 o posterior.

```powershell
npm install
npm run dev
```

Abrir http://127.0.0.1:4173/. También se puede usar `Iniciar AstroPocket.cmd`.

Para ejecutar el build sin el servidor de desarrollo:

```powershell
npm run build
npm start
```

El servidor escucha únicamente en esta PC. `PORT` permite cambiar el puerto de `npm start`.

## Conexión con Claude

La demo pide la clave de Anthropic antes de entrar. **Recordar en este navegador** conserva una copia cifrada con AES-GCM en un almacén IndexedDB separado, con una clave de cifrado no exportable. La credencial activa viaja en la cabecera de cada consulta y no se incluye en el historial ni en el build. **Conexión IA → Desconectar y olvidar** elimina el recuerdo. Es almacenamiento del mismo origen, no una cuenta ni una protección frente a código malicioso ejecutado en ese origen.

En esta PC puede seguir usándose la conexión ya configurada en `.env.local`; se ofrece como opción local al entrar. En Vercel esa opción no existe y la API exige la clave del visitante, aunque el entorno tenga una clave del dueño. No se escriben credenciales del visitante en el servidor. El modelo configurado es `claude-sonnet-5-5`; la segunda fase con otros proveedores queda fuera de esta versión.

Las posiciones y las búsquedas manuales funcionan sin IA. La conversación envía los mensajes recientes, el nombre del perfil y las posiciones natales a Anthropic. Usa el saldo de esa cuenta. La app no requiere una API de Astro-Seek.

## Usar la consola

- **Soulfile / Carta:** permite conservar las posiciones heredadas o calcular una carta con fecha, hora y ciudad de nacimiento. Incluye búsqueda local de ciudades, cambios históricos de zona horaria, Placidus/signos enteros/casas iguales, rueda ampliada y tabla de posiciones. Si no se conoce la hora, no se generan Ascendente ni casas.
- **Nova:** conversación con historial local, transmisión de texto, detener, reintentar y exportar TXT. **Nueva** conserva la conversación anterior; **Retomar** permite recuperarla cuando el canal está vacío.
- **Cronoscopio / Cielo:** escribir fecha y hora en UTC−03 fijo (ART) y pulsar **IR**. **Ahora** vuelve al cielo actual. Mapa, posiciones, aspectos y filtro de orbe.
- **Ventana:** buscar contactos exactos en intervalos de hasta un año. Tocar un resultado selecciona su fecha y prepara el análisis con Nova. El chat puede consultar estos mismos cálculos con herramientas.
- **Sólo Nova:** doble clic sobre el personaje o botón ↗. La misma conversación sin los paneles de instrumental. Escape o ↙ vuelve a la consola.
- **Taller / Estilo:** botón de paleta en la cabecera, o ◈ junto al canal. Cinco personajes: Nova original; Mimo, homenaje al dispositivo Tamagotchi con mascota LCD; Volt, homenaje a las criaturas de Pokémon; Seraf, alas, ruedas y ojos de inspiración bíblica; Nulo, una anomalía flotante. Cada forma conserva mirada, toque, arrastre y estados de actividad.
- **Temas:** Nebulosa violeta, Jardín LCD claro y Observatorio ámbar. Cambian superficies, cartas y tipografía de lectura; el personaje se elige por separado. Las selecciones se aplican al instante y se conservan en esta PC.
- **Lectura:** tres tamaños, modo tranquilo para pausar movimiento continuo, compositor que crece al escribir y posición estable mientras llega la respuesta. «Ir al final» permite avanzar voluntariamente. El borrador también se guarda localmente. Los datos técnicos quedan desplegables.
- **Nova como personaje:** mirada hacia el cursor, saludo al tocar, arrastre con recuperación, escucha, escaneo, habla, reconocimiento y sueño por inactividad. Sonido voluntario, apagado al abrir. Respeta movimiento reducido.
- **Escuchar lectura:** disponible debajo de cada respuesta terminada. Kokoro genera audio neuronal en español en el servidor de AstroPocket, con pronunciación de eSpeak NG. Dora y Alex se eligen en Taller → La lectura. Permite pausar, reanudar y detener. El servidor prepara pesos públicos en su primera lectura y puede reutilizarlos mientras siga activo. El texto de la lectura elegida se envía al servidor para convertirlo en audio, sin otro proveedor de voz. No necesita otra clave ni reproduce automáticamente.

Carta, historial, fecha y último intervalo quedan en el almacenamiento de este navegador. No hay cuenta ni sincronización entre dispositivos. Las lecturas guardan su fecha e intervalo consultados.

El presupuesto de Claude contempla razonamiento y texto. Una frase previa a las herramientas no cuenta como lectura completada: se comprueba el cierre real, y si falta se intenta una única finalización sin nuevas herramientas usando los resultados obtenidos. Las interrupciones voluntarias no disparan ese intento. Las pruebas de regresión no hacen llamadas pagas.

## Cálculos y límites

Se usa Swiss Ephemeris 2.10.03 mediante @kuntay/swisseph 0.2.2, con archivos locales .se1 derivados de DE441. El motor verifica SHA-256 de los archivos y rechaza la caída silenciosa a Moshier. Las posiciones de la interfaz y las herramientas de Nova usan este mismo motor. Astronomy Engine permanece sólo para pruebas de comparación y código histórico.

Se compararon 60 posiciones —Júpiter a Plutón, primer día de cada mes de 2026 a las 12:00 UT— con las tablas DE431 publicadas por Astro-Seek. La diferencia máxima respecto de sus cifras de cuatro decimales fue 0,2083 segundos de arco. La referencia y los casos están en tests/astro-seek-reference.json. Esto no certifica todos los cuerpos, épocas, casas o configuraciones.

Una instalación nueva empieza con una carta de ejemplo del 01/01/2000 a las 12:00 en Buenos Aires, identificada como muestra. Las cartas ya guardadas en el navegador se conservan. «Calcular mi carta» obtiene planeta, Ascendente, Medio Cielo, nodo verdadero y casas del instante y ubicación indicados. La hora local se convierte mediante una zona IANA; se rechazan horas ambiguas o inexistentes por cambios de horario. La fecha, hora y ciudad quedan locales. Nova recibe posiciones y contexto de casas, sin esas coordenadas ni datos de nacimiento.

Los tránsitos incluyen diez planetas; no incluyen nodo, Quirón ni Lilith en tránsito. Las lentes interpretativas no convierten el zodíaco a sideral ni calculan dashas o una carta dracónica. La interpretación sigue siendo simbólica y conserva el estilo de Nova. Los datos calculados no garantizan acontecimientos de vida.

El buscador muestrea cada seis horas y refina cruces; contactos extremadamente próximos a una estación requieren contraste adicional. La hora mostrada no implica certificación profesional.

GeoNames cities15000 se descargó el 17/10/2026: 34.166 lugares con coordenadas y zona IANA, consultados únicamente en el servidor local. Ver FUENTES-Y-LICENCIAS.md para procedencia y licencias.

## Verificar

```powershell
npm test
npm run build
```

Las pruebas cubren el cruce 360°/0°, nombres de signos, un equinoccio publicado por USNO, pasos retrógrados, intervalos, cancelación, fechas inválidas y límites de acceso de la API. No hacen llamadas pagas a Anthropic.

La investigación estética y de comportamiento está en `IDENTIDAD-Y-REFERENCIAS.md`. El ensayo independiente del personaje sigue en `/referencias/nova-lab.html`.

## Vercel y código fuente

`vercel.json` define el build Vite y una función Node compartida para `/api/*`, con efemérides y ciudades incluidas. `.vercelignore` excluye claves, pruebas, capturas y archivos privados de trabajo. La demo no incluye una clave del dueño: cada visitante conecta Anthropic. Ver `DEPLOY-VERCEL.md`.

AstroPocket se publica bajo **GNU AGPL v3 o posterior**, por decisión del titular del proyecto. El código correspondiente está en [github.com/pat031-prog/astropocket](https://github.com/pat031-prog/astropocket) y se ofrece desde la app. `LICENSE`, `THIRD-PARTY-NOTICES.md` y `FUENTES-Y-LICENCIAS.md` documentan las condiciones y créditos de las dependencias.


