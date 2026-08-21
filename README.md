<h2 align="center">Gestor de datos georreferenciados</br>(interno)</h2>

<p align="center">
  <a href="https://agstnrdz.github.io/gestor-geoestadistico/"><strong>Ver la aplicación en vivo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/licencia-MIT-blue.svg" alt="Licencia MIT">
  <img src="https://img.shields.io/badge/demo-online-brightgreen.svg" alt="Demo online">
</p>

<br>

Esta es una aplicación web interna para visualizar y gestionar datos georreferenciados del municipio. Se sirve como sitio estático desde GitHub Pages y también puede abrirse directamente como archivo local (`file://`) sin necesidad de servidor.

### Flujo completo

### Caso 1 - Actualizar una capa de puntos existente (CSV)

**Ejemplo: nueva versión del relevamiento de rampas.**

1. Exportar desde la planilla / sistema de campo como CSV con columnas `lat` y `lng`.
2. Reemplazar `datos/rampas_acceso.csv` con el archivo nuevo.
3. Desde la raíz del repositorio, correr:
   ```
   python datos/generar_capa.py rampas_acceso.csv --nombre rampas --renombrar ramp_id=id estado_rampa=estado
   ```
4. El script genera (o sobreescribe):
   - `docs/assets/data/rampas.geojson`
   - `docs/assets/data/rampas_data.js` → variable `window.RAMPAS_DATA`
5. Listo. El visor ya usa los datos nuevos.

---

### Caso 2 - Agregar datos censales a las capas de barrios (GeoJSON desde QGIS)

**Ejemplo: cargar población y densidad por barrio.**

1. En QGIS, abrir la capa de barrios y completar la tabla de atributos con los campos censales (`pob`, `dens_pob`, etc.).
2. Exportar como GeoJSON, CRS WGS84 (EPSG:4326). Guardarlo como `datos/barrios_poblacion.geojson`.
3. Correr:
   ```
   python datos/generar_capa.py barrios_poblacion.geojson --nombre barrios
   ```
4. El script genera:
   - `docs/assets/data/barrios.geojson`
   - `docs/assets/data/barrios_data.js` → variable `window.BARRIOS_DATA`

**Ejemplo: cargar distribución por sexo.**

1. Mismo proceso, exportar como `datos/barrios_x_sexo.geojson` con campos `nombre`, `mujer`, `varon`, `total`.
2. Correr — notar que `--nombre` es `barrios_sexo`, no `barrios_x_sexo`:
   ```
   python datos/generar_capa.py barrios_x_sexo.geojson --nombre barrios_sexo
   ```
3. El script genera:
   - `docs/assets/data/barrios_sexo.geojson`
   - `docs/assets/data/barrios_x_sexo_data.js` → variable `window.BARRIOS_SEXO_DATA`

---

### Caso 3 - Agregar una capa completamente nueva

Este es el flujo completo cuando se quiere incorporar un dataset nuevo al visor (por ejemplo, establecimientos educativos).

**Paso 1 — Preparar los datos fuente**

- Si es una capa de puntos: crear `datos/establecimientos_educativos.csv` con columnas `lat`, `lng` y los atributos necesarios.
- Si es una capa de polígonos: exportar desde QGIS como `datos/establecimientos_educativos.geojson`.

**Paso 2 — Generar los archivos web**

```
# Para puntos (CSV):
python datos/generar_capa.py establecimientos_educativos.csv --nombre establecimientos_educativos

# Para polígonos (GeoJSON):
python datos/generar_capa.py establecimientos_educativos.geojson --nombre establecimientos_educativos
```

Esto genera en `docs/assets/data/`:
- `establecimientos_educativos.geojson`
- `establecimientos_educativos_data.js` → `window.ESTABLECIMIENTOS_EDUCATIVOS_DATA`

**Paso 3 - Crear el módulo de visualización**

Crear el archivo `docs/assets/capas/establecimientos_educativos.js`. Este archivo define `window.CAPA_CONFIG` con:
- Metadatos (id, título, descripción)
- El nombre del archivo de datos que debe cargar (`dataScripts`)
- La función `buildPanel()` — genera el HTML del panel lateral (filtros, leyenda)
- La función `buildStats()` — genera los chips de estadísticas
- La función `init(map)` — toda la lógica Leaflet de esa capa

Tomar como referencia `docs/assets/capas/rampas_accesibilidad.js` para puntos o `docs/assets/capas/barrios_poblacion.js` para polígonos.

**Paso 4 - Agregar la tarjeta en la galería**

Agregar una card en `docs/capas.html` con el `href` apuntando a `visor.html?capa=establecimientos_educativos`.

**El visor (`visor.html`) nunca se modifica.** Carga cualquier capa dinámicamente a partir del parámetro `?capa=` en la URL.

---

## Tabla de referencia: capas actuales

| Capa en el visor | Archivo de módulo | Archivo de datos | Variable JS | Fuente original |
|---|---|---|---|---|
| Rampas de accesibilidad | `capas/rampas_accesibilidad.js` | `data/rampas_data.js` | `RAMPAS_DATA` | `datos/rampas_acceso.csv` |
| Población por barrios | `capas/barrios_poblacion.js` | `data/barrios_data.js` | `BARRIOS_DATA` | GeoJSON desde QGIS (`--nombre barrios`) |
| Sexo por barrios | `capas/barrios_x_sexo.js` | `data/barrios_x_sexo_data.js` | `BARRIOS_SEXO_DATA` | GeoJSON desde QGIS (`--nombre barrios_sexo`) |

**Capa de referencia (no es una capa del visor):**

| Archivo | Variable JS | Uso |
|---|---|---|
| `data/limites_barrios.geojson` | — (no tiene `_data.js`) | Se carga directamente como fondo en el visor de rampas |

---

## Actualizar el catálogo de metadatos

El catálogo (`catalogo.html`) ya no tiene los datos hardcodeados. Lee `docs/assets/data/catalogo_data.js`, que se genera desde `datos/catalogo.csv`.

**Flujo para actualizar el catálogo:**

1. Editar `datos/catalogo.csv` (agregar fila, modificar campos, cambiar estado, etc.).
2. Desde la raíz del repositorio, correr:
   ```
   python datos/generar_catalogo.py
   ```
3. El script sobreescribe `docs/assets/data/catalogo_data.js` y el catálogo se actualiza.

**Columnas del CSV:**

| Columna | Obligatoria | Descripción |
|---|---|---|
| `prefijo_id` | ✅ | Código de 4 letras del dataset (ej: `ramp`) |
| `nombre_dataset` | ✅ | Nombre técnico sin espacios (ej: `rampas_accesibilidad`) |
| `descripcion` | ✅ | Nombre legible que aparece en la tabla |
| `campos` | ✅ | Lista de campos separados por coma. Vacío = sin datos aún |
| `cant_campos` | ✅ | Número entero. Vacío = null |
| `fecha_creacion` | ✅ | Formato M/D/AAAA (ej: `10/1/2025` = octubre 2025) |
| `estado` | ✅ | `Publicado` / `En desarrollo` / `Pendiente` |
| `vinculo` | — | Nombre del archivo Excel local (ej: `Rampas de acceso.xlsx`) |
| `sheets_url` | — | URL pública de Google Sheets. Vacío = sin vínculo |
| `categoria` | — | Categoría temática (ej: `Salud y bienestar`) |
| `tipo_geometria` | — | `Puntos` / `Polígonos` / `Líneas` |
| `cant_registros` | — | Número de registros en el dataset |
| `formatos_disponibles` | — | Formatos de descarga (ej: `.xlsx, .shp`) |

**Para agregar `sheets_url` a un dataset:** publicar la hoja en Google Sheets (Archivo → Compartir → Publicar en la web), copiar el enlace y pegarlo en la columna `sheets_url` del CSV. Al correr el script, aparecerá el botón "Ver en Google Sheets" en el detalle expandible de ese dataset.

---