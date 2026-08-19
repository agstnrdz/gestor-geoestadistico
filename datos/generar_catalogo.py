#!/usr/bin/env python3
"""Convierte datos/catalogo.csv en docs/assets/data/catalogo_data.js (columnas: ver CLAUDE.md)."""

import csv
import json
import os
import sys


def auto_int(valor):
    if not valor or not str(valor).strip():
        return None
    try:
        return int(valor)
    except ValueError:
        return None


def none_si_vacio(valor):
    v = (valor or '').strip()
    return v if v else None


def leer_catalogo(ruta_csv):
    datasets = []

    for encoding in ('utf-8-sig', 'utf-8', 'latin-1'):
        try:
            with open(ruta_csv, encoding=encoding, newline='') as f:
                reader = csv.DictReader(f)
                filas  = list(reader)
            break
        except UnicodeDecodeError:
            continue
    else:
        print('Error: no se pudo leer el archivo con ningún encoding conocido.')
        sys.exit(1)

    for i, fila in enumerate(filas, start=1):
        dataset = {
            'id':                  i,
            'prefijo':             none_si_vacio(fila.get('id')),
            'nombre':              none_si_vacio(fila.get('nombre_dataset')),
            'tipo_geom':           none_si_vacio(fila.get('tipo_geom')),
            'crs':                 none_si_vacio(fila.get('crs')),
            'categoria':           none_si_vacio(fila.get('categoria')),
            'descripcion':         none_si_vacio(fila.get('descripcion')),
            'registros_cant':      auto_int(fila.get('registros_cant')),
            'estado_interno':      none_si_vacio(fila.get('estado_interno')),
            'estado_visor':        none_si_vacio(fila.get('estado_visor')),
            'visor_al_dia':        none_si_vacio(fila.get('visor_al_día') or fila.get('visor_al_dia')),
            'campos':              none_si_vacio(fila.get('campos')),
            'campos_cant':         auto_int(fila.get('campos_cant')),
            'fecha_crea':          none_si_vacio(fila.get('fecha_crea')),
            'fecha_ult_mod':       none_si_vacio(fila.get('fecha_ult_mod')),
            'version':             none_si_vacio(fila.get('version')),
            'formatos':            none_si_vacio(fila.get('formatos_disponibles')),
            'vinculo':             none_si_vacio(fila.get('vinculo')),
        }
        datasets.append(dataset)

    return datasets


def escribir_js(datasets, ruta_js):
    contenido = (
        '// Generado automáticamente por datos/generar_catalogo.py\n'
        '// No editar manualmente — editar datos/catalogo.csv y volver a correr el script.\n'
        'window.CATALOGO_DATA = '
        + json.dumps(datasets, ensure_ascii=False, indent=2)
        + ';\n'
    )
    with open(ruta_js, 'w', encoding='utf-8') as f:
        f.write(contenido)


def main():
    raiz     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta_csv = os.path.join(raiz, 'datos', 'catalogo.csv')
    ruta_js  = os.path.join(raiz, 'docs', 'assets', 'data', 'catalogo_data.js')

    if not os.path.exists(ruta_csv):
        print(f'Error: no se encontró {ruta_csv}')
        sys.exit(1)

    print(f'Leyendo: {ruta_csv}')
    datasets = leer_catalogo(ruta_csv)
    print(f'  {len(datasets)} datasets leídos')

    escribir_js(datasets, ruta_js)
    print(f'Generado: {ruta_js}  →  window.CATALOGO_DATA')

    entregados   = sum(1 for d in datasets if d['estado_interno'] == 'Entregado')
    publicados   = sum(1 for d in datasets if d['estado_visor'] == 'Publicado')
    sin_campos   = sum(1 for d in datasets if not d['campos'])
    total_reg    = sum(d['registros_cant'] or 0 for d in datasets)
    print(f'\n  Estado interno — Entregados : {entregados}')
    print(f'  Estado visor  — Publicados : {publicados}')
    print(f'  Sin campos aún             : {sin_campos}')
    print(f'  Total registros            : {total_reg}')
    print(f'\n✓ Listo.')


if __name__ == '__main__':
    main()
