# Brothers in Arms: Art of War — proyecto web

Port experimental del juego Java ME a una implementación nativa de navegador. La página pública ofrece la descarga del JAR aportado por el usuario y un acceso al emulador Java ME externo.

## Enlaces
- **Web:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/
- **Descarga directa del JAR:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/biatouchsc_8vr9ermj.jar
- **Repositorio:** https://github.com/serverlocal29-star/-brothers-in-arms-art-of-war
- **Emulador:** https://zb3.github.io/freej2me-web/

## Cómo jugar en iPhone
1. Abre la web del proyecto y pulsa **JUGAR** o **DESCARGAR JAR**.
2. Si el navegador guarda el JAR en Archivos, abre FreeJ2ME Web.
3. Importa el JAR en el emulador. La página web no puede arrancar por sí sola un MIDlet Java ME: necesita el runtime del emulador.

## Estado real
La web está publicada como lanzador/descargador del JAR. **No es todavía un port nativo jugable ni una integración de arranque directo dentro de FreeJ2ME.** La variante JAR puede ser táctil, pero los controles y la orientación deben verificarse en el emulador; no se garantiza un rendimiento de 20 FPS.

El port nativo de original-port/ sigue siendo experimental y no está terminado. Faltan la reconstrucción y validación del bucle de juego, escenas, mapas, colisiones, enemigos, armas, audio y misiones.

## Pruebas
Con Node.js 20 o compatible:

    node --test original-port/*.test.mjs

Proyecto de aficionados no afiliado a Gameloft. Las marcas y el juego pertenecen a sus titulares.
