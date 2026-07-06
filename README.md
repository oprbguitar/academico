# Academic Finder IA

Demo web para GitHub Pages y extension Chrome MV3 para buscar, ordenar, guardar, citar, exportar y analizar fuentes academicas en espanol.

## Uso rapido

- Demo web: abrir `index.html` o publicar el repositorio con GitHub Pages.
- Extension Chrome: cargar esta carpeta como extension sin empaquetar desde `chrome://extensions`.
- Clave demo de creador: `PERULABS-CREATOR-2026`.

La clave de creador es solo para demostracion, pruebas y presentaciones comerciales. La logica de activacion es intencionalmente simple para una version estatica y esta aislada para poder reemplazarse despues por licencias con backend.

## Funciones incluidas

- Ordenamiento de resultados desde los mas recientes hasta los mas antiguos.
- Selector de resultados por pagina: 10, 50 o 100.
- Modo `Busqueda exacta` y `Busqueda exploratoria`.
- Seleccion automatica de modo segun el tipo de consulta.
- Panel premium cerrable, con continuidad en modo basico.
- Selector de proveedor IA, perfil de analisis y metadatos editables de modelos.
- Analisis breve por puntos: idea principal, relevancia, metodologia, citas, usos y advertencias.
- Captura de texto seleccionado o contenido visible de la pagina actual en la extension.
- Side panel de Chrome para mantener Academic Finder IA abierto junto a paginas academicas.
- Guardado de fuentes, generacion de citas y exportacion JSON/CSV/BibTeX.

## Archivos principales

- `index.html`: demo publica para GitHub Pages.
- `popup.html`: interfaz principal de la extension.
- `sidepanel.html`: version lateral/pineada.
- `manifest.json`: configuracion Chrome MV3.
- `src/app.js`: logica compartida de busqueda, premium, IA, citas y exportacion.
- `src/providerMetadata.js`: configuracion mantenible de proveedores, categorias y notas.
- `src/styles.css`: estilos responsive en espanol.
