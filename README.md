# Brothers in Arms: Art of War — web launcher

Sitio web para abrir la versión Java ME original del juego dentro de la misma página mediante FreeJ2ME-Web. El emulador queda integrado detrás del lanzador; no se envía al jugador a la página principal de FreeJ2ME.

## Enlaces
- **Web:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/
- **Repositorio:** https://github.com/serverlocal29-star/-brothers-in-arms-art-of-war
- **JAR original incluido:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/biatouchsc_8vr9ermj.jar
- **Proyecto del motor:** https://github.com/zb3/freej2me-web

## Cómo funciona
- La portada usa el icono del juego extraído del JAR cuando el archivo incluye un PNG compatible; el favicon del proyecto sirve como alternativa.
- Al tocar el icono, se carga `emulator/run.html?app=8vr9ermj&fractionScale=1&mobile=1` dentro de un iframe a pantalla completa de la página.
- `mobile=1` activa el teclado táctil que incluye FreeJ2ME-Web. No se debe ocultar: los botones virtuales son parte de los controles.
- El flujo de GitHub Actions copia los archivos de FreeJ2ME-Web al sitio, crea el paquete `apps/8vr9ermj.zip` con configuración del juego y publica el sitio en GitHub Pages.
- FreeJ2ME-Web depende de CheerpJ alojado externamente, por lo que la ejecución necesita conexión a Internet y puede tardar en iniciar.

## Limitaciones que deben probarse
Una compilación exitosa de Pages solo confirma que los archivos se publicaron; no demuestra por sí sola que el MIDlet haya llegado al menú ni que todas las misiones funcionen. El bloqueo de orientación y la API de pantalla completa dependen del navegador; en iPhone puede ser necesario girar el dispositivo manualmente o añadir el sitio a la pantalla de inicio.

El directorio `original-port/` contiene experimentos de port nativo y no es todavía una reimplementación completa del juego.

## Pruebas locales
Con Node.js 20 o compatible:

```sh
node --test original-port/*.test.mjs
```

Proyecto de aficionados no afiliado a Gameloft. El juego, sus marcas y recursos pertenecen a sus titulares.
