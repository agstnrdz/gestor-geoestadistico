"""Genera XML de metadatos ISO 19139 para capas en formato .gpkg (pip install pygeometa)."""

import sqlite3
import os
import argparse
from datetime import date
from pygeometa.schemas.iso19139 import ISO19139OutputSchema

ORGANISMO = "Municipalidad de Comodoro Rivadavia"
DEPENDENCIA = "Dirección General de Modernización e Investigación Territorial"
ROL_POSICION = "Geoestadísticas"
DIRECCION = "Manuel Belgrano 965"
CIUDAD = "Comodoro Rivadavia"
PROVINCIA = "Chubut"
PAIS = "Argentina"
CODIGO_POSTAL = "9000"
EMAIL = "mit@comodoro.gov.ar"
URL_DISTRIBUCION = "https://comodoro.gov.ar/miciudad"
LICENCIA = "Creative Commons Attribution 4.0"
CRS_EPSG = "EPSG:5344"
IDIOMA = "spa"
CODIFICACION = "utf8"

BBOX = {
    "west": -68.0,
    "east": -67.3,
    "south": -45.9,
    "north": -45.7,
}


def leer_capas_gpkg(ruta_gpkg):
    conn = sqlite3.connect(ruta_gpkg)
    cur = conn.cursor()

    cur.execute("""
        SELECT
            table_name,
            identifier,
            description,
            last_change
        FROM gpkg_contents
        WHERE data_type IN ('features', 'attributes')
    """)
    capas = cur.fetchall()
    conn.close()

    if not capas:
        print("⚠ No se encontraron capas vectoriales en el GPKG.")
    return capas


def construir_mcf(nombre_capa, identificador, descripcion, fecha_modificacion):
    if fecha_modificacion:
        fecha_str = fecha_modificacion[:10]
    else:
        fecha_str = str(date.today())

    titulo = identificador if identificador else nombre_capa
    abstract = descripcion if descripcion else f"Capa georreferenciada: {nombre_capa}"

    mcf = {
        "mcf": {"version": "1.0"},

        "metadata": {
            "identifier": nombre_capa,
            "language": IDIOMA,
            "charset": CODIFICACION,
            "hierarchylevel": "dataset",
            "datestamp": str(date.today()),
        },

        "spatial": {
            "datatype": "vector",
            "geomtype": "unknown",
        },

        "identification": {
            "language": IDIOMA,
            "charset": CODIFICACION,
            "title": {"es": titulo},
            "abstract": {"es": abstract},
            "dates": {
                "creation": fecha_str,
                "publication": fecha_str,
            },
            "keywords": {
                "default": {
                    "keywords": {"es": ["Comodoro Rivadavia", "GIS", "datos espaciales"]},
                    "keywords_type": "theme",
                }
            },
            "topiccategory": ["boundaries"],
            "extents": {
                "spatial": [
                    {
                        "bbox": [
                            BBOX["west"],
                            BBOX["south"],
                            BBOX["east"],
                            BBOX["north"],
                        ],
                        "crs": 4326,
                    }
                ],
            },
            "accessconstraints": "otherRestrictions",
            "otherconstraints": LICENCIA,
            "status": "completed",
            "maintenancefrequency": "asNeeded",
            "url": URL_DISTRIBUCION,
        },

        "contact": {
            "main": {
                "individualname": DEPENDENCIA,
                "organization": ORGANISMO,
                "positionname": ROL_POSICION,
                "address": DIRECCION,
                "city": CIUDAD,
                "administrativearea": PROVINCIA,
                "postalcode": CODIGO_POSTAL,
                "country": PAIS,
                "email": EMAIL,
                "url": URL_DISTRIBUCION,
                "role": "owner",
            },
            "distribution": {
                "individualname": DEPENDENCIA,
                "organization": ORGANISMO,
                "positionname": ROL_POSICION,
                "address": DIRECCION,
                "city": CIUDAD,
                "administrativearea": PROVINCIA,
                "postalcode": CODIGO_POSTAL,
                "country": PAIS,
                "email": EMAIL,
                "url": URL_DISTRIBUCION,
                "role": "distributor",
            },
        },

        "distribution": {
            "sitio_web": {
                "url": URL_DISTRIBUCION,
                "type": "WWW:LINK-1.0-http--link",
                "name": "Portal Municipal",
                "description": {"es": "Sitio web institucional con visualizador de datos"},
                "function": "information",
            }
        },

        "dataquality": {
            "scope": {"level": "dataset"},
            "lineage": {
                "statement": {"es": "Generado por la Dirección General de Modernización e Investigación Territorial, Municipalidad de Comodoro Rivadavia."}
            },
        },
    }

    return mcf


def generar_xml(mcf, nombre_capa, carpeta_salida):
    schema = ISO19139OutputSchema()

    try:
        xml_string = schema.write(mcf)
        nombre_archivo = os.path.join(carpeta_salida, f"{nombre_capa}.xml")

        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(xml_string)

        print(f"  ✓ Generado: {nombre_archivo}")
        return True

    except Exception as e:
        print(f"  ✗ Error generando XML para '{nombre_capa}': {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Genera metadatos ISO 19139 (.xml) desde un archivo .gpkg"
    )
    parser.add_argument(
        "--gpkg",
        required=True,
        help="Ruta al archivo .gpkg (ej: datos/limites_barrios.gpkg)"
    )
    parser.add_argument(
        "--salida",
        default=None,
        help="Carpeta de salida para los XML (por defecto: misma carpeta que el GPKG)"
    )
    args = parser.parse_args()

    ruta_gpkg = args.gpkg

    if not os.path.exists(ruta_gpkg):
        print(f"✗ No se encontró el archivo: {ruta_gpkg}")
        return

    carpeta_salida = args.salida if args.salida else os.path.dirname(os.path.abspath(ruta_gpkg))
    os.makedirs(carpeta_salida, exist_ok=True)

    print(f"\n📂 Procesando: {ruta_gpkg}")
    print(f"📁 Salida en:  {carpeta_salida}\n")

    capas = leer_capas_gpkg(ruta_gpkg)

    if not capas:
        return

    exitosos = 0
    for nombre_capa, identificador, descripcion, fecha_modificacion in capas:
        print(f"→ Procesando capa: {nombre_capa}")
        mcf = construir_mcf(nombre_capa, identificador, descripcion, fecha_modificacion)
        ok = generar_xml(mcf, nombre_capa, carpeta_salida)
        if ok:
            exitosos += 1

    print(f"\n✔ {exitosos} de {len(capas)} XML generados correctamente.")


if __name__ == "__main__":
    main()
