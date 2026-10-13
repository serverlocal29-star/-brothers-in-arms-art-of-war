# Brothers in Arms: Art of War — Port nativo para navegador

Este repositorio está dedicado al port nativo del juego Java original a HTML5 Canvas y JavaScript. La reconstrucción web anterior se ha retirado.

## Estado actual

**No es todavía una versión jugable.** La base del viewport lógico de 320 × 250 y el adaptador inicial de entradas están en `original-port/`. La lógica original, el decodificador de recursos binarios, los mapas, las colisiones, las armas, los enemigos y las misiones aún deben portarse y verificarse contra el JAR de referencia.

## Abrir el proyecto

- Página de estado: [GitHub Pages](https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/)
- Código del port nativo: [original-port/](https://github.com/serverlocal29-star/-brothers-in-arms-art-of-war/tree/main/original-port)

## Principios del port

- No ejecutar el JAR dentro de un emulador.
- No sustituir el juego original por una reconstrucción inventada.
- Mantener la proporción y el viewport lógico de la versión analizada.
- Adaptar controles táctiles y mandos Bluetooth sin alterar las acciones originales.
- No publicar el JAR comercial ni sus recursos extraídos en el repositorio público.

La publicación web mostrará el estado real del port hasta que haya una implementación nativa que se pueda probar.
