# AstroPocket — consola retrofuturista y personaje principal

17 de octubre de 2026.

## Corrección de dirección

La referencia central es la búsqueda estética de la v9.6 original: consola oscura, tipografía de terminal, carta natal y tránsitos como instrumentos, y el bicho como personaje principal. La inspiración indicada por el usuario es Nintendo/Pokémon, especialmente sus microinteracciones.

Se restauraron `App.tsx`, `components/ChatInterface.tsx` e `index.html` desde el ZIP original. El CSS del dashboard dejó de aplicarse. La exploración descartada está preservada en `C:\Users\Big Duck\Desktop\AstroPocket-exploraciones\dashboard-descartado-2026-10-17.zip`. El árbol de componentes nuevos permanece como material inactivo de esa exploración.

## Repos explorados

Se consultaron los repositorios originales, sus README y, donde se indica, archivos de implementación. Las aplicaciones de referencia no se instalaron ni se incorporaron como dependencias.

| Repositorio | Hallazgo | Aplicación posible a AstroPocket |
| --- | --- | --- |
| [Imetomi/retro-futuristic-ui-design](https://github.com/Imetomi/retro-futuristic-ui-design) | CRT y dispositivo LCD en React; curvatura, fósforo, carcasa, boot y navegación de teclado. Revisados `CRTTerminal.tsx` y sus estados. Código MIT. | Profundizar la materialidad de la consola conservando sus colores y personalidad. Es la referencia visual más cercana. |
| [GitSquared/edex-ui](https://github.com/GitSquared/edex-ui) | Terminal de ciencia ficción con paneles y telemetría, personalización y sonidos. Archivado; GPL-3.0. | Tratar carta y tránsitos como instrumental conectado a datos reales. Referencia de composición e interacción. |
| [Swordfish90/cool-retro-term](https://github.com/Swordfish90/cool-retro-term) | Material CRT parametrizable. Revisado `app/qml/ShaderTerminal.qml`: brillo, curvatura, ruido, persistencia y resolución. | Diseñar la calidad de la luz y la respuesta del monitor. Graduar el efecto para conservar lectura cómoda. |
| [adryd325/oneko.js](https://github.com/adryd325/oneko.js) | Revisado `oneko.js`: estados de alerta, reposo, distracción y sueño; respuesta al cursor. JavaScript, MIT. | Pequeños comportamientos autónomos y miradas que comuniquen intención con muy pocos recursos. |
| [cixiangtao/sprite-pet](https://github.com/cixiangtao/sprite-pet) | Runtime TypeScript que separa eventos de comportamiento, estados semánticos, atlas y tiempos de cuadro. Código MIT; proyecto exploratorio. | Referencia para estructurar el comportamiento del bicho existente. El arte de sus ejemplos tiene condiciones propias; no se utilizó. |
| [Tuxemon/Tuxemon](https://github.com/Tuxemon/Tuxemon) | RPG abierto de criaturas, con diálogos, interacción, scripting y distintos controles. | Estudiar secuencias y ritmo de respuesta propios de un juego de criaturas, conservando el personaje de AstroPocket. |
| [clippyjs/clippy.js](https://github.com/clippyjs/clippy.js) | Revisado `src/agent.js`: cola de acciones, `gestureAt`, `moveTo`, animaciones de entrada/salida y reposo. | Encadenar mirada, gesto y habla; orientar al usuario hacia un punto del instrumental. |

También se exploró [ARWES](https://github.com/arwes/arwes). Su README actual declara falta de mantenimiento y limitaciones con Strict Mode y React; sirve como referencia de marcos/sonido, pero no se propone adoptarlo como base de esta aplicación. Se leyó además la descripción de [retro-web-terminal](https://github.com/transitive-bullshit/retro-web-terminal); no fue una referencia prioritaria para el personaje.

## Qué ya existía en el personaje

El bicho original tenía antenas, ojos con miradas laterales y parpadeos, pequeños indicadores y estados visuales asociados a acciones. La variante avanzada conservada bajo `src/components/PocketGuide` también incluye estados de ánimo, diálogos, sugerencias y sonido. Esa búsqueda es el punto de partida.

## Gramática propuesta de microinteracciones

Cada gesto necesita una intención legible y un final. Una secuencia útil: anticipar → actuar → reconocer → volver al reposo.

| Acción del usuario | Respuesta del personaje | Sentido |
| --- | --- | --- |
| Señalar un planeta | Mira primero con los ojos; las antenas y el cuerpo acompañan con menor intensidad | Atención compartida |
| Tocar al bicho | Breve compresión, gesto de agrado y pequeño rebote | Reconoce el contacto |
| Arrastrarlo | Inclinación ligada al movimiento, expresión de sorpresa y recuperación al soltar | Sensación de peso y presencia |
| Empezar a escribir | Ojos atentos, antenas elevadas y pequeños movimientos al ritmo de la entrada | Escucha antes de producir una respuesta |
| Iniciar una consulta | Pausa de anticipación, gesto concentrado y actividad breve de indicadores | Hace visible el proceso |
| Recibir una respuesta | Gesto breve de satisfacción y mirada dirigida hacia el resultado | Cierra la acción |
| Esperar | Respiración, parpadeos y miradas espaciadas; luego sueño suave | Sigue presente sin necesitar texto constante |
| Volver a tocarlo | Despierta, se orienta y reconoce al usuario | Continuidad entre sesiones de atención |

La mayor parte de estos gestos puede responder localmente al instante. El tiempo de una consulta de IA puede ser acompañado por el personaje sin bloquear su expresividad. El texto y el gesto deben apoyarse: una reacción puede bastar por sí sola.

## Ensayo interactivo separado

[Abrir laboratorio de Nova](http://127.0.0.1:4173/referencias/nova-lab.html).

El ensayo conserva la silueta reconocible del robot: cuerpo oscuro, dos ojos, antenas, luces y tipografía de terminal. Prueba mirada, toque, escucha, concentración, reconocimiento, sorpresa, arrastre y sueño. El sonido se activa voluntariamente y usa tonos originales generados en la página.

Es un experimento de comportamiento independiente. No llama a la IA, no consulta efemérides ni reemplaza la consola principal. No integra código o sprites de los repos investigados. Los enlaces y una imagen de referencia externa aparecen al pie de la página.

La implementación posterior en el producto parte de este ensayo y del bicho original, manteniendo consola, carta y tránsitos dentro del mismo mundo visual.

## Integración en la consola

La consola principal ahora usa estos comportamientos en `NovaCompanion`: seguimiento del puntero sin renderizar toda la app en cada movimiento, saludo y rebote, arrastre acotado, inclinación, recuperación, sueño, escucha al escribir, escaneo durante herramientas y reconocimiento al terminar. Los tonos son propios y voluntarios. El personaje sigue siendo código CSS y formas originales; no usa sprites de Pokémon ni arte de otros repos.

La carcasa recupera violeta/cian, esquinas de instrumento, luz contenida, tipografías de terminal y una textura CRT tenue. Los paneles muestran datos reales: carta guardada, conversación y cronoscopio. En móvil se navegan por pestañas. La lectura de mensajes tiene prioridad sobre el efecto visual y se respeta movimiento reducido.

La conversación se conectó a Anthropic mediante herramientas del servidor. `skyAtDate` consulta el motor para un instante; `findContacts` busca cruces exactos en un intervalo. Los resultados aparecen en el instrumental y conservan contexto temporal en la lectura. Las búsquedas manuales no requieren IA. Las credenciales se leen en el servidor, sin insertarse en el bundle del navegador.

Los límites y pasos para ejecutar la versión actual están en `README.md`. El contraste sistemático contra Astro-Seek/Swiss Ephemeris sigue pendiente; el vínculo a Astro-Seek no implica una integración ni una certificación.

## Comprobación del ensayo

En navegador se probaron sueño → toque → despertar; señalar Saturno → mirada curiosa; escribir → escucha; señal → anticipación → concentración → reconocimiento → reposo. Se verificó el arrastre con una interacción real de puntero y el registro de recuperación al soltar. La vista móvil de 390 px no presentó desbordes horizontales. La imagen externa del repo de Imetomi cargó correctamente. El build de la consola restaurada pasó, con la advertencia de tamaño de bundle que ya tenía la versión original.
