window.CAPA_CONFIG = {

  id:          'barrios_nivel_instruccion',
  titulo:      'Nivel de instrucción por <span>barrios</span>',
  nombreCorto: 'Nivel de instrucción',
  desc:        'Nivel de instrucción de la población por barrio — Comodoro Rivadavia. 77 barrios.',
  esTest:      false,

  dataScripts: ['assets/data/barrios_nivel_instruccion_data.js'],

  _CAMPOS: [
    { key: 'sin_instruccion',  label: 'Sin instrucción'          },
    { key: 'prim_incompleto',  label: 'Primario incompleto'      },
    { key: 'prim_completo',    label: 'Primario completo'        },
    { key: 'sec_incompleto',   label: 'Secundario incompleto'    },
    { key: 'sec_completo',     label: 'Secundario completo'      },
    { key: 'terc_incompleto',  label: 'Terciario incompleto'     },
    { key: 'terc_completo',    label: 'Terciario completo'       },
    { key: 'univ_incompleto',  label: 'Universitario incompleto' },
    { key: 'univ_completo',    label: 'Universitario completo'   },
    { key: 'pos_incompleto',   label: 'Posgrado incompleto'      },
    { key: 'pos_completo',     label: 'Posgrado completo'        },
  ],

  _INDICADORES: [
    {
      key:     'sin_instruccion',
      label:   'Sin instrucción',
      campos:  ['sin_instruccion'],
      breaks:  [8, 10, 12, 14],
      labels:  ['< 8 %', '8 – 10 %', '10 – 12 %', '12 – 14 %', '≥ 14 %'],
      colores: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
    },
    {
      key:     'primario',
      label:   'Nivel primario',
      campos:  ['prim_incompleto', 'prim_completo'],
      breaks:  [15, 22, 28, 35],
      labels:  ['< 15 %', '15 – 22 %', '22 – 28 %', '28 – 35 %', '≥ 35 %'],
      colores: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
    },
    {
      key:     'secundario',
      label:   'Nivel secundario',
      campos:  ['sec_incompleto', 'sec_completo'],
      breaks:  [35, 42, 45, 48],
      labels:  ['< 35 %', '35 – 42 %', '42 – 45 %', '45 – 48 %', '≥ 48 %'],
      colores: ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5', '#084594'],
    },
    {
      key:     'superior',
      label:   'Nivel superior (terc/univ/pos)',
      campos:  ['terc_incompleto', 'terc_completo', 'univ_incompleto', 'univ_completo', 'pos_incompleto', 'pos_completo'],
      breaks:  [12, 20, 28, 38],
      labels:  ['< 12 %', '12 – 20 %', '20 – 28 %', '28 – 38 %', '≥ 38 %'],
      colores: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
    },
    {
      key:     'superior_completo',
      label:   'Superior completo',
      campos:  ['terc_completo', 'univ_completo', 'pos_completo'],
      breaks:  [4, 7, 12, 20],
      labels:  ['< 4 %', '4 – 7 %', '7 – 12 %', '12 – 20 %', '≥ 20 %'],
      colores: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
    },
  ],

  _indicadorActivo: 'secundario',
  _layer: null,

  _calcTotal(p) {
    return this._CAMPOS.reduce((s, c) => s + (p[c.key] || 0), 0);
  },

  _calcPct(p, ind) {
    const total = this._calcTotal(p);
    if (!total) return null;
    return ind.campos.reduce((s, k) => s + (p[k] || 0), 0) / total * 100;
  },

  _getColor(pct, ind) {
    if (pct === null) return '#d0cdd6';
    for (let i = ind.breaks.length - 1; i >= 0; i--) {
      if (pct >= ind.breaks[i]) return ind.colores[i + 1];
    }
    return ind.colores[0];
  },

  buildPanel() {
    const cfg  = window.CAPA_CONFIG;
    const opts = cfg._INDICADORES.map(ind =>
      `<option value="${ind.key}"${ind.key === cfg._indicadorActivo ? ' selected' : ''}>${ind.label}</option>`
    ).join('');

    return `
      <div>
        <p class="panel-section-title">Indicador</p>
        <div class="select-wrap">
          <select class="filter-select" id="indicador-select"
                  onchange="capaChangeIndicador(this.value)" aria-label="Seleccionar indicador">
            ${opts}
          </select>
        </div>
      </div>

      <div>
        <p class="panel-section-title">Leyenda (% del barrio)</p>
        <div id="leyenda-instruccion" style="display:flex;flex-direction:column;gap:0.4rem"></div>
      </div>

      <div>
        <p class="panel-section-title">Top 3 barrios</p>
        <div id="instruccion-top3"
             style="font-size:0.82rem;color:var(--text-sub);display:flex;flex-direction:column;gap:0.3rem"></div>
      </div>
    `;
  },

  buildStats(container) { container.innerHTML = ''; },

  _updateLeyenda(ind) {
    const el = document.getElementById('leyenda-instruccion');
    if (!el) return;
    el.innerHTML =
      ind.colores.map((c, i) => `
        <div class="dens-item">
          <div class="dens-swatch" style="background:${c}"></div>
          <span>${ind.labels[i]}</span>
        </div>`).join('') +
      `<div class="dens-item">
         <div class="dens-swatch" style="background:#d0cdd6"></div>
         <span>Sin dato</span>
       </div>`;
  },

  _updateTop3(feats, ind) {
    const el  = document.getElementById('instruccion-top3');
    const cfg = window.CAPA_CONFIG;
    if (!el) return;
    const ranked = feats
      .map(f => ({ nombre: f.properties.nombre, pct: cfg._calcPct(f.properties, ind) }))
      .filter(x => x.pct !== null)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
    el.innerHTML = ranked.map(x => `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.4rem">
        <span style="font-size:0.78rem;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x.nombre}</span>
        <strong style="font-size:0.78rem;color:var(--accent);flex-shrink:0">${x.pct.toFixed(1)} %</strong>
      </div>`).join('');
  },

  init(map) {
    const cfg   = window.CAPA_CONFIG;
    const feats = BARRIOS_NIVEL_INSTRUCCION_DATA.features;

    function makePopup(p) {
      const total = cfg._calcTotal(p);
      const filas = cfg._CAMPOS.map(c => {
        const v   = p[c.key] || 0;
        const pct = total ? (v / total * 100).toFixed(1) : '—';
        const w   = total ? Math.min(Math.round(v / total * 100), 100) : 0;
        return `
          <div style="display:flex;align-items:center;gap:0.45rem;padding:0.2rem 0;
                      border-top:1px solid rgba(0,0,0,0.05)">
            <span style="font-size:0.7rem;color:#666;width:138px;flex-shrink:0">${c.label}</span>
            <div style="flex:1;height:5px;background:rgba(0,0,0,0.1);border-radius:3px;overflow:hidden">
              <div style="width:${w}%;height:100%;background:var(--accent);border-radius:3px;
                          opacity:0.75"></div>
            </div>
            <span style="font-size:0.7rem;color:#333;width:80px;text-align:right;flex-shrink:0">
              ${v.toLocaleString('es-AR')}
              <span style="color:#aaa">(${pct}%)</span>
            </span>
          </div>`;
      }).join('');

      return `
        <div class="popup-inner" style="min-width:320px">
          <div class="popup-id">Barrio</div>
          <div class="popup-calle">${p.nombre}</div>
          <div class="popup-row">
            <span>Total relevado</span>
            <span>${total.toLocaleString('es-AR')} personas</span>
          </div>
          <div style="margin-top:0.55rem">${filas}</div>
        </div>`;
    }

    const indInicial = cfg._INDICADORES.find(i => i.key === cfg._indicadorActivo);

    cfg._layer = L.geoJSON(BARRIOS_NIVEL_INSTRUCCION_DATA, {
      style(feat) {
        const ind = cfg._INDICADORES.find(i => i.key === cfg._indicadorActivo);
        return {
          fillColor:   cfg._getColor(cfg._calcPct(feat.properties, ind), ind),
          fillOpacity: 0.78,
          color:       'rgba(255,255,255,0.7)',
          weight:      1.2,
        };
      },
      onEachFeature(feat, layer) {
        layer.bindPopup(makePopup(feat.properties), { maxWidth: 380 });
        layer.on('mouseover', function () {
          this.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 0.95 });
          this.bringToFront();
        });
        layer.on('mouseout', function () { cfg._layer.resetStyle(this); });
      },
    }).addTo(map);

    map.fitBounds(cfg._layer.getBounds(), { padding: [20, 20] });

    const totalPob = feats.reduce((s, f) => s + cfg._calcTotal(f.properties), 0);
    const pctSec   = feats.reduce((s, f) => {
      const p = f.properties;
      return s + (p.sec_incompleto || 0) + (p.sec_completo || 0);
    }, 0);
    const pctSup = feats.reduce((s, f) => {
      const p = f.properties;
      return s + (p.terc_completo || 0) + (p.univ_completo || 0) + (p.pos_completo || 0);
    }, 0);

    document.getElementById('stats-row').innerHTML = `
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">holiday_village</span>
        Barrios: <strong>77</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">school</span>
        Población relevada: <strong>${totalPob.toLocaleString('es-AR')}</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">menu_book</span>
        Nivel secundario: <strong>${(pctSec / totalPob * 100).toFixed(1)} %</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">workspace_premium</span>
        Superior completo: <strong>${(pctSup / totalPob * 100).toFixed(1)} %</strong>
      </div>`;

    document.getElementById('showing-count').textContent = '77';
    document.getElementById('map-unit').textContent = 'barrios';

    cfg._updateLeyenda(indInicial);
    cfg._updateTop3(feats, indInicial);

    window.capaChangeIndicador = function (key) {
      cfg._indicadorActivo = key;
      const ind = cfg._INDICADORES.find(i => i.key === key);
      cfg._layer.setStyle(feat => ({
        fillColor:   cfg._getColor(cfg._calcPct(feat.properties, ind), ind),
        fillOpacity: 0.78,
        color:       'rgba(255,255,255,0.7)',
        weight:      1.2,
      }));
      cfg._updateLeyenda(ind);
      cfg._updateTop3(feats, ind);
    };
  },
};
