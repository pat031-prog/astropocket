# AstroPocket en Vercel

Proyecto: `astropocket`, equipo `pat031-progs-projects`. Código AGPL-3.0 o posterior autorizado por el titular y accesible desde la app en https://github.com/pat031-prog/astropocket .

## Construcción

Vite / Node.js 22 o posterior. Ejecutar `npm ci` y `npm run build`; salida `dist`. `prebuild` copia el runtime WASM de voz desde la dependencia instalada. No hay que guardar binarios generados en Git.

El handler Node `api/index.ts` atiende `/api/*`, máximo 300 segundos, con datos locales de Swiss Ephemeris y GeoNames incluidos. Los encabezados COOP/COEP permiten usar hasta cuatro hilos para voz en navegadores compatibles.

## Credenciales

No configurar una `ANTHROPIC_API_KEY` compartida. Cada navegador aporta la suya. El handler público ignora claves del dueño y deshabilita la escritura de configuración. `ANTHROPIC_MODEL` es opcional; por defecto `claude-sonnet-5-5`.

Recordar la clave usa AES-GCM y una clave no exportable en IndexedDB. Se puede desconectar y olvidar desde Conexión IA. No hay cuentas ni sincronización.

`.vercelignore` excluye `.env*`, `artifacts`, pruebas, la exploración anterior y descargas ZIP/TXT. El atlas JSON y los datos Swiss se incluyen sólo en la función. No se publican cartas personales.

## Verificación de una publicación

1. Abrir sin clave y comprobar la puerta de entrada.
2. Rechazar una clave inválida; conectar una válida y recargar con Recordar activado.
3. Pedir una búsqueda anual: debe entregar la lectura después de consultar el motor, en el mismo turno.
4. Calcular un nacimiento de prueba y comprobar doce casas cuando la hora es conocida.
5. Escuchar, pausar, reanudar y detener. La primera escucha descarga Kokoro; el audio se genera en el dispositivo.
6. Probar los tres temas, cinco personajes, modo sólo Nova y pantalla pequeña.
7. Confirmar `/api/status` en modo demo, sin clave compartida, y acceso al código AGPL.

Evidencia en `VERIFICACION.md`. Las pruebas automáticas no hacen llamadas pagas.
