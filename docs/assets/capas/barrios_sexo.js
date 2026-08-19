window.CAPA_CONFIG = {

  id:          'barrios_sexo',
  titulo:      'Sexo por <span>barrios</span>',
  nombreCorto: 'Sexo por barrios',
  desc:        'Distribución de mujeres y varones por barrio — Comodoro Rivadavia. 77 barrios.',
  esTest:      false,

  dataScripts: ['assets/data/barrios_sexo_data.js'],

  _breaks: [47, 49, 50, 51, 53],
  _colors: ['#2166ac', '#92c5de', '#f7f7f7', '#f4a582', '#b5546a'],
  _labels: [
    '< 47 % mujeres',
    '47 – 49 %',
    '49 – 51 % (equilibrado)',
    '51 – 53 %',
    '> 53 % mujeres',
  ],

  _getColor(pct) {
    if (pct == null) return '#cccccc';
    const b = this._breaks, c = this._colors;
    if (pct < b[0]) return c[0];
    if (pct < b[1]) return c[1];
    if (pct < b[2]) return c[2];
    if (pct < b[3]) return c[3];
    if (pct < b[4]) return c[4];
    return c[4];
  },

  buildPanel() {
    const legendItems = this._colors.map((c, i) => `
      <div class="dens-item">
        <div class="dens-swatch" style="background:${c}"></div>
        <span>${this._labels[i]}</span>
      </div>`).join('');
    return `
      <div>
        <p class="panel-section-title">% mujeres por barrio</p>
        <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.5rem">
          ${legendItems}
        </div>
      </div>
      <div>
        <p class="panel-section-title">Mayor población</p>
        <div id="barrios-top3" style="font-size:0.82rem;color:var(--text-sub);display:flex;flex-direction:column;gap:0.3rem"></div>
      </div>`;
  },

  buildStats(container) { container.innerHTML = ''; },

  init(map) {
    const cfg = window.CAPA_CONFIG;

    L.geoJSON(BARRIOS_SEXO_DATA, {
      style(feat) {
        const p   = feat.properties;
        const pct = p.total > 0 ? (p.mujer / p.total) * 100 : null;
        return { fillColor: cfg._getColor(pct), fillOpacity: 0.75, color: '#555', weight: 0.8, opacity: 0.8 };
      },
      onEachFeature(feat, layer) {
        const p    = feat.properties;
        const pct  = p.total > 0 ? ((p.mujer / p.total) * 100).toFixed(1) : null;
        const pctV = p.total > 0 ? ((p.varon / p.total) * 100).toFixed(1) : null;
        const fmtMuj = p.mujer != null ? Number(p.mujer).toLocaleString('es-AR') + (pct  != null ? ` (${pct}%)`  : '') : 'Sin dato';
        const fmtVar = p.varon != null ? Number(p.varon).toLocaleString('es-AR') + (pctV != null ? ` (${pctV}%)` : '') : 'Sin dato';
        const fmtTot = p.total != null ? Number(p.total).toLocaleString('es-AR') : 'Sin dato';
        layer.bindPopup(`
          <div class="popup-inner">
            <div class="popup-id">Barrio</div>
            <div class="popup-calle">${p.nombre}</div>
            <div class="popup-row"><span>Mujeres</span><span>${fmtMuj}</span></div>
            <div class="popup-row"><span>Varones</span><span>${fmtVar}</span></div>
            <div class="popup-row"><span>Total</span><span>${fmtTot}</span></div>
          </div>`, { maxWidth: 220 });
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.95, weight: 1.5 }));
        layer.on('mouseout',  () => layer.setStyle({ fillOpacity: 0.75, weight: 0.8 }));
      },
    }).addTo(map);

    const feats   = BARRIOS_SEXO_DATA.features;
    const totMuj  = feats.reduce((s, f) => s + (f.properties.mujer || 0), 0);
    const totVar  = feats.reduce((s, f) => s + (f.properties.varon || 0), 0);
    const totPob  = feats.reduce((s, f) => s + (f.properties.total || 0), 0);
    const pctMuj  = totPob > 0 ? ((totMuj / totPob) * 100).toFixed(1) : '—';

    document.getElementById('stats-row').innerHTML = `
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">holiday_village</span>
        Barrios: <strong>77</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:#b5546a">female</span>
        Mujeres: <strong>${totMuj.toLocaleString('es-AR')} (${pctMuj}%)</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:#2166ac">male</span>
        Varones: <strong>${totVar.toLocaleString('es-AR')}</strong>
      </div>`;

    const top3El = document.getElementById('barrios-top3');
    if (top3El) {
      const conDatos = feats.filter(f => f.properties.total != null);
      if (conDatos.length === 0) {
        top3El.innerHTML = '<span style="font-size:0.78rem;font-style:italic;color:var(--text-sub)">Sin datos censales aún</span>';
      } else {
        [...conDatos].sort((a, b) => b.properties.total - a.properties.total).slice(0, 3)
          .forEach(f => {
            top3El.innerHTML += `<div style="display:flex;justify-content:space-between;">
              <span style="font-size:0.78rem">${f.properties.nombre}</span>
              <strong style="font-size:0.78rem;color:var(--text-main)">${Number(f.properties.total).toLocaleString('es-AR')}</strong>
            </div>`;
          });
      }
    }

    document.getElementById('showing-count').textContent = '77';
    document.getElementById('map-unit').textContent = 'barrios';
  },
};
