# Cambios de la consola

La exploración de dashboard anterior fue descartada. La implementación activa retoma la consola violeta/cian y a Nova como compañero, con conversación Anthropic, herramientas de efemérides, selección de fecha y búsqueda de contactos.

La dirección estética, los repos abiertos investigados y su incorporación están documentados en `IDENTIDAD-Y-REFERENCIAS.md`. `README.md` describe la versión actual, cómo ejecutarla y los límites de los cálculos.

El ensayo descartado permanece en `C:\Users\Big Duck\Desktop\AstroPocket-exploraciones\dashboard-descartado-2026-10-17.zip`.

## Revisión de conversación y Nova

La charla pasa a ser la superficie principal: texto de lectura de 16–17 px, ancho limitado, párrafos espaciados, scroll estable durante la respuesta, entrada que crece y datos técnicos desplegables. Se mantiene la consola violeta/cian y el CRT dentro de Nova.

Nova tiene un modo Solo por doble clic que conserva la misma conversación. En ventanas pequeñas se compacta cuando hay mensajes. La carta separa rueda y posiciones, permite ampliarla y usa Ascendente y casas reales cuando se calcula desde nacimiento.

Los cálculos activos usan Swiss Ephemeris local. Hay formulario de nacimiento con atlas GeoNames y una comparación numérica reproducible con 60 posiciones de Astro-Seek. Ver `VERIFICACION.md` para los resultados y sus límites.

## Taller de Nova — 18/10/2026

Cinco siluetas: robot original, huevo LCD, criatura eléctrica, serafín y anomalía. El taller permite compararlas con retratos grandes sin cerrar el selector en cada elección. Tres temas completos e independientes del personaje: Nebulosa, Jardín LCD y Observatorio. Tamaño de lectura configurable y pausa de animación ambiental, pestañas con teclado, contraste del tema claro y borrador persistente.

Se corrigió además un fallo de conversación: el límite de 2400 tokens podía consumirse sólo en razonamiento después de las herramientas y dejar visible únicamente una promesa de buscar. Se ajustó el presupuesto y esfuerzo, se reserva un paso de cierre y se comprueba que haya texto final; el sistema puede cerrar una vez con los resultados ya calculados, sin repetir las búsquedas.

## Revisión móvil y traslado de carta

Selector de temas con radios nativos y tarjeta completa táctil; las tres opciones ocupan menos altura. El taller tiene altura definida y cuerpo desplazable para Safari, con cabecera y pie accesibles. Controles principales de 44 px, campos de 16 px, áreas seguras y ajuste a VisualViewport para mantener el compositor visible al abrir el teclado. Se conserva el zoom manual.

El enlace personal precarga un nacimiento y requiere calcularlo antes de reemplazar la carta del dispositivo. Sólo contiene datos de nacimiento en el fragmento; excluye claves e historial. Se añadió nodo medio/verdadero explícito para contrastar configuraciones de Astro-Seek sin alterar cartas antiguas. Los datos personales usados para el contraste quedan fuera del repositorio.
