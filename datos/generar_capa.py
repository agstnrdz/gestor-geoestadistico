#!/usr/bin/env python3
"""Convierte CSV o GeoJSON de datos/ en GeoJSON + JS para el visor (ver --help)."""

import argparse
import csv
import json
import os
import sys


def auto_cast(valor):
    if valor == '' or valor is None:
        return None
    try:
        return int(valor)
    except ValueError:
        pass
    try:
        return float(valor)
    except ValueError:
        pass
    return valor


def csv_a_geojson(ruta, renombrar, separador=','):
    for encoding in ('utf-8-sig', 'utf-8', 'latin-1'):
        try:
            with open(ruta, encoding=encoding, newline='') as f:
                reader = csv.DictReader(f, delimiter=separador)
                cols = [c for c in reader.fieldnames if c and c.strip()]
                filas = []
                for fila in reader:
                    if all((fila.get(c) or '').strip() == '' for c in cols):
                        continue
                    filas.append({c: fila[c] for c in cols})
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError(f'No se pudo leer el CSV: {ruta}')

    features = []
    omitidas = 0
    for fila in filas:
        lat_s = (fila.get('lat') or '').strip()
        lng_s = (fila.get('lng') or '').strip()
        if not lat_s or not lng_s:
            omitidas += 1
            continue
        try:
            lat, lng = float(lat_s), float(lng_s)
        except ValueError:
            omitidas += 1
            continue

        props = {}
        for col in cols:
            if col in ('lat', 'lng'):
                continue
            nombre = renombrar.get(col, col)
            props[nombre] = auto_cast((fila[col] or '').strip())

        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [lng, lat]},
            'properties': props,
        })

    if omitidas:
        print(f'  ⚠ {omitidas} fila(s) omitida(s) por falta de coordenadas.')

    print(f'  Columnas detectadas: {cols}')
    if renombrar:
        print(f'  Renombrar: {renombrar}')

    return {'type': 'FeatureCollection', 'features': features}


def leer_geojson(ruta):
    for encoding in ('utf-8-sig', 'utf-8', 'latin-1'):
        try:
            with open(ruta, encoding=encoding) as f:
                data = json.load(f)
            break
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            last_error = e
            continue
    else:
        raise ValueError(f'No se pudo leer el GeoJSON: {last_error}')

    if data.get('type') != 'FeatureCollection':
        raise ValueError(
            f'El archivo no es un GeoJSON válido (type={data.get("type")}). '
            'Debe ser FeatureCollection.'
        )

    feats = data.get('features', [])
    tipos_geom = {f['geometry']['type'] for f in feats if f.get('geometry')}
    props_ejemplo = list((feats[0].get('properties') or {}).keys()) if feats else []
    print(f'  Geometría: {", ".join(tipos_geom)}')
    print(f'  Propiedades: {props_ejemplo}')

    return data


def escribir_salidas(coleccion, ruta_geojson, ruta_js, nombre_var):
    with open(ruta_geojson, 'w', encoding='utf-8') as f:
        json.dump(coleccion, f, ensure_ascii=False, indent=2)
    print(f'Generado: {ruta_geojson}')

    with open(ruta_js, 'w', encoding='utf-8') as f:
        f.write(nombre_var + ' = ')
        f.write(json.dumps(coleccion, ensure_ascii=False, separators=(',', ':')))
        f.write(';\n')
    print(f'Generado: {ruta_js}  →  {nombre_var}')


def main():
    parser = argparse.ArgumentParser(
        description='Convierte CSV o GeoJSON de /datos/ en archivos para el visor de mapas.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        'archivo',
        help='Nombre del archivo en /datos/ (ej: rampas_acceso.csv o limites_barrios.geojson)',
    )
    parser.add_argument(
        '--nombre', metavar='BASE',
        help='Nombre base para los archivos de salida (sin extensión). '
             'Por defecto: nombre del archivo de entrada.',
    )
    parser.add_argument(
        '--renombrar', nargs='*', default=[], metavar='original=nuevo',
        help='(Solo CSV) Renombrar columnas. Ej: --renombrar ramp_id=id estado_rampa=estado',
    )
    parser.add_argument(
        '--separador', default=',', metavar='SEP',
        help='(Solo CSV) Separador de columnas. Por defecto: coma. Usar ";" si es punto y coma.',
    )
    args = parser.parse_args()

    raiz     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ruta_in  = os.path.join(raiz, 'datos', args.archivo)

    if not os.path.exists(ruta_in):
        print(f'Error: no se encontró "{ruta_in}"')
        sys.exit(1)

    ext          = os.path.splitext(args.archivo)[1].lower()
    nombre_base  = args.nombre or os.path.splitext(args.archivo)[0]
    nombre_var   = 'window.' + nombre_base.upper().replace('-', '_').replace(' ', '_') + '_DATA'
    ruta_geojson = os.path.join(raiz, 'docs', 'assets', 'data', nombre_base + '.geojson')
    ruta_js      = os.path.join(raiz, 'docs', 'assets', 'data', nombre_base + '_data.js')

    renombrar = {}
    for item in args.renombrar:
        if '=' in item:
            orig, nuevo = item.split('=', 1)
            renombrar[orig.strip()] = nuevo.strip()

    print(f'Entrada : {ruta_in}')

    if ext == '.csv':
        coleccion = csv_a_geojson(ruta_in, renombrar, args.separador)
    elif ext in ('.geojson', '.json'):
        if args.renombrar:
            print('  ℹ --renombrar se ignora para GeoJSON (las propiedades se preservan tal como están).')
        coleccion = leer_geojson(ruta_in)
    else:
        print(f'Error: formato "{ext}" no soportado. Usar .csv o .geojson')
        sys.exit(1)

    n = len(coleccion.get('features', []))
    print(f'  {n} features leídas')

    escribir_salidas(coleccion, ruta_geojson, ruta_js, nombre_var)
    print(f'\n✓ {n} features exportadas correctamente.')


if __name__ == '__main__':
    main()
