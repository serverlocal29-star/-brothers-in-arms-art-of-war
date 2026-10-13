# Brothers in Arms: Art of War — proyecto web

Port experimental del juego Java ME a una implementación nativa de navegador. La portada pública y el entorno técnico están separados.

## Enlaces
- **Web:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/
- **Diagnóstico técnico:** https://serverlocal29-star.github.io/-brothers-in-arms-art-of-war/original-port/
- **Repositorio:** https://github.com/serverlocal29-star/-brothers-in-arms-art-of-war

## Estado real
**Todavía no es jugable.** La portada no simula una partida ni abre un emulador externo. START lleva al área técnica del proyecto.

Existen lectores de recursos ZIP/binarios con pruebas automatizadas, documentación de formatos investigados y una base de adaptación de entradas. Falta reconstruir y validar el bucle de juego, la lógica, las escenas, mapas, colisiones, enemigos, armas, audio y misiones.

## Estructura
- `index.html`: portada pública.
- `assets/css/site.css`: estilos de la web.
- `assets/js/site.js`: navegación de portada.
- `assets/images/favicon.svg`: icono del sitio.
- `original-port/`: lectores, adaptadores, documentación y pruebas del port nativo.
- `reference/legacy-locales/`: cadenas antiguas de interfaz conservadas como referencia; no son un juego activo.
- `.github/workflows/pages.yml`: pruebas y despliegue a GitHub Pages.

## Pruebas
Con Node.js 20 o compatible:
```sh
node --test original-port/*.test.mjs
```
GitHub Actions ejecuta las pruebas antes de publicar.

## Criterios
- No llamar jugable al proyecto hasta validar una partida real.
- No sustituir el juego por misiones inventadas ni presentar un emulador externo como port.
- No publicar el JAR propietario ni recursos extraídos en este repositorio público.
- Mantener la proporción lógica de la versión analizada y validar los controles con pruebas.

Proyecto de aficionados no afiliado a Gameloft. Las marcas y el juego pertenecen a sus titulares.