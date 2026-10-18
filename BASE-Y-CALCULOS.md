# AstroPocket: base elegida y siguiente etapa

Revisión local: 17 de octubre de 2026.

## Decisión

Retomar `C:\Users\Big Duck\Desktop\AstroPocket-v9.6`, extraído de `copy-of-astropocket-v9.6.zip`. Es la mejor base para conservar la identidad retrofuturista: mapa natal, rueda natal/tránsitos, chat contextual, siete modos interpretativos, navegación móvil y Pocket Guide.

La prioridad indicada por el usuario es contrastar cálculos y tránsitos con referencias como Astro-Seek. La siguiente etapa debe resolver esa base de cálculo antes de ampliar las lecturas de IA.

## Comparación comprobada

| Versión | Qué conservar | Qué falta resolver | Decisión |
| --- | --- | --- | --- |
| ZIP del Escritorio, `copy-of-astropocket-v9.6.zip` | Interfaz con más identidad, ruedas, tránsitos en vivo y Pocket Guide | Carta natal fija, integración de IA desde el navegador, código duplicado | Base de producto |
| Carpeta `C:\Users\Big Duck\AstropocketCCode` | Separación conceptual entre cálculo, interpretación y API; formulario de nacimiento | Ascendente aproximado, zona horaria ignorada en la conversión, errores de TypeScript | Referencia arquitectónica; revisar cada pieza antes de reutilizarla |
| ZIP de Documentos, `astropocket-v9.6.zip` | Antecedente del mismo producto | Menos desarrollo de interfaz que el ZIP del Escritorio | Conservar como antecedente |

## Evidencia de la revisión

- La v9.6 del Escritorio se instaló, generó el build y se abrió correctamente en el navegador. Se observaron mapa natal, rueda de tránsitos, aspectos y Pocket Guide. Esto verifica funcionamiento de la interfaz, no precisión numérica frente a otras calculadoras.
- El build informa una referencia a `index.css` inexistente y un bundle superior a 500 kB. El navegador advierte que Tailwind por CDN no es la configuración para producción.
- `npx tsc --noEmit` falla por importaciones inexistentes en el árbol duplicado `src/`. La entrada efectiva es `index.tsx` → `App.tsx` en la raíz. El build de Vite no realiza ese chequeo de tipos.
- En `AstropocketCCode`, los chequeos de tipos de backend y frontend fallan. No se modificó su código; ya existía un `package-lock.json` sin seguimiento en Git.
- No se realizaron llamadas de pago a la IA ni se probó la generación con una credencial real.

## Problemas concretos del cálculo actual

**En la v9.6 elegida:**

1. `constants.ts` contiene una carta natal fija; no hay cálculo completo de nacimiento para distintos perfiles.
2. `services/astronomyService.ts` sí calcula posiciones planetarias con Astronomy Engine. Su precisión respecto a las referencias aún no fue medida.
3. El nodo norte figura entre los cuerpos, pero se omite al generar los tránsitos.
4. Las ruedas tienen su propia conversión de signos mediante prefijos ingleses. Por ejemplo, `Acuario` no coincide con `Aquarius`. El servicio de aspectos usa otra conversión que sí contempla ambos nombres. Hay que unificar los datos antes de confiar en la representación visual.
5. Los modos cambian el prompt interpretativo. No implementan por sí solos un zodíaco sideral ni una transformación dracónica.
6. Para fechas pasadas o futuras el prompt solicita una búsqueda a Gemini. Debemos calcular la fecha solicitada con el motor y entregar el resultado estructurado al modelo.

**En AstropocketCCode:**

- El ascendente se aproxima como longitud del Sol + 90°. Las coordenadas recibidas no participan en ese cálculo.
- La ruta natal construye una fecha con `new Date(fecha + 'T' + hora)` sin aplicar la zona horaria de nacimiento.
- La distancia angular usa el operador resto de JavaScript sin normalizar valores negativos; necesita casos de prueba alrededor de 0°/360° y para ambos órdenes de los planetas.
- Varios fallos del proveedor de IA terminan en una lectura de ejemplo. Esa condición debería quedar identificada en la respuesta y en la interfaz.

## Referencias y criterio de implementación

- [Astro-Seek: herramientas y calendarios](https://horoscopes.astro-seek.com/astro-seek-tools-search/?no_mobile=1&tool_jmeno=calendar): referencia funcional para calendarios personales, aspectos exactos y orbes configurables. La información indexada fue consultada; el acceso directo automatizado devolvió 403. No se certificó coincidencia numérica con Astro-Seek.
- [Swiss Ephemeris: documentación general](https://www.astro.com/swisseph/swisseph.htm): candidato para posiciones, nodos, ángulos, casas y variantes de zodíaco.
- [Swiss Ephemeris: interfaz de programación](https://www.astro.com/swisseph/swephprg.htm): referencia de parámetros, escalas de tiempo, velocidades y errores. La biblioteca no determina por sí sola la zona horaria histórica de un lugar.
- [Swiss Ephemeris: licencia oficial](https://github.com/aloistr/swisseph/blob/master/LICENSE): ofrece AGPL o licencia profesional. Resolver el modelo de distribución antes de incorporar esta dependencia al producto público.
- [Astrodienst / Astro.com](https://www.astro.com/): segunda referencia independiente de interfaz para contrastar resultados bajo la misma configuración.

Propuesta: un servicio de cálculo determinista propio; Astro-Seek y Astro.com como referencias de contraste. La integración debe usar una biblioteca o API documentada. No se comprobó la existencia de una API pública oficial de Astro-Seek en esta revisión.

## Primera entrega propuesta: cálculo verificable

1. **Nacimiento:** fecha, hora, coordenadas y zona horaria histórica explícitas. Guardar también el instante UTC resuelto. Si la hora es desconocida, indicarlo y omitir los resultados que dependan de ella.
2. **Convenciones:** documentar zodíaco, sistema de casas, nodo medio/verdadero, marco de coordenadas y orbes. Empezar con un perfil occidental tropical y opciones claras de casas.
3. **Una representación compartida:** identificadores estables de planetas y signos, longitudes normalizadas y traducción al español únicamente al presentar. Las ruedas, tablas, aspectos y contexto de IA deben consumir el mismo resultado.
4. **Tránsitos:** fecha seleccionable y búsqueda por intervalo, con entrada en orbe, contacto exacto, salida y repeticiones por retrogradación. Diferenciar aproximación, separación y exactitud.
5. **Trazabilidad:** registrar versión del motor, efemérides utilizadas, configuración y advertencias. Si faltan datos o un sistema de casas no puede calcularse, informarlo expresamente.
6. **Contraste reproducible:** usar casos sintéticos o públicos con entradas y parámetros idénticos en AstroPocket y las referencias. Comparar longitudes, ángulos, cúspides, velocidades y tiempos de contactos. Definir tolerancias por magnitud y documentar las discrepancias antes de anunciar compatibilidad.

Casos mínimos: cruce Aries/Piscis, cambio de día entre hora local y UTC, cambios históricos de horario, hemisferio sur, latitudes altas, estaciones retrógradas, nodo medio frente a verdadero y fecha sin hora de nacimiento.

## Después del cálculo

- Llevar las credenciales de IA al servidor. El `define` de Vite actual sustituye la clave dentro del código que recibe el navegador.
- Sustituir la inserción de HTML sin sanitizar en las respuestas del chat por un renderizador seguro.
- Conservar los modos de lectura y Pocket Guide, pero respaldar cada afirmación técnica con los datos calculados. La IA interpreta los resultados; el motor determina posiciones y fechas.
- Mejorar legibilidad, contraste y tamaño de las ruedas; dar protagonismo a una vista del cielo actual y una línea temporal de tránsitos.
- Ordenar el árbol duplicado `src/` conservando las variantes útiles antes de retirar código inactivo.

## Ejecutar esta copia local

Desde `C:\Users\Big Duck\Desktop\AstroPocket-v9.6`:

```powershell
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Abrir [AstroPocket local](http://127.0.0.1:4173/). El ZIP original permanece intacto. Esta revisión preparó una copia ejecutable y el diagnóstico; todavía no reemplazó el motor ni certificó los cálculos.
