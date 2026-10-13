# Brothers in Arms: Art of War — Web Port

Proyecto web experimental en español, pensado para navegador móvil y escritorio.

## Ejecutar

La página raíz redirige a la carpeta game/. El juego es estático: no necesita Node, servidor propio, CDN ni dependencias externas.

- PC: WASD o flechas para moverse, ratón para apuntar, clic/espacio para disparar, R para recargar, G para granada, 1/2/3 para cambiar arma, P/Esc para pausa.
- Móvil: joystick táctil y botones en pantalla.
- Progreso: se guarda localmente en el navegador.

## Alcance

Esta es una reconstrucción web experimental jugable de 13 misiones en tres campañas. No es una conversión fiel de todos los mapas, scripts, recursos y cinemáticas del juego Java original ni está afiliada a Ubisoft o Gameloft.

## Publicación

En GitHub, abre Settings → Pages y selecciona Deploy from a branch, rama main, carpeta /(root), y guarda. Luego abre la URL de GitHub Pages que GitHub muestre en esa pantalla.

## Controles y prueba del JAR original

- El prototipo web limita su bucle principal a un objetivo de 20 FPS.
- Mando estándar: stick izquierdo/cruceta para moverse, stick derecho para apuntar en escritorio, A disparar, B granada, X recargar, Y cambiar arma, LB/RB seleccionar arma y Start pausar. El mapeo depende del mando y del navegador.
- En móvil hay joystick táctil y botones en pantalla.
- **JAR original:** el botón de la página abre FreeJ2ME Web, un emulador Java ME en el navegador. Por separado, carga allí tu propio archivo JAR. El repositorio no incluye ni redistribuye el JAR comercial. FreeJ2ME Web requiere conexión a Internet y la compatibilidad del título debe probarse.

Esta implementación web experimental no equivale todavía a una conversión fiel del juego comercial original.