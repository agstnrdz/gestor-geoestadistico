window.CAPA_CONFIG = {

  id:          'barrios_poblacion',
  titulo:      'Población por <span>barrios</span>',
  nombreCorto: 'Población por barrios',
  desc:        'Densidad poblacional por barrio — Comodoro Rivadavia. 77 barrios relevados.',
  esTest:      false,

  dataScripts: ['assets/data/barrios_data.js'],

  _breaks:    [0, 500, 1800, 5300, 8500],
  _colors:    ['#e8e0f5', '#c5aee8', '#9f7ed0', '#7b5ea7', '#4a2d7f'],
  _labels:    [
    '0 – 500 hab/km²',
    '500 – 1.800 hab/km²',
    '1.800 – 5.300 hab/km²',
    '5.300 – 8.500 hab/km²',
    '> 8.500 hab/km²',
  ],
  _nullColor: '#d0cdd6',

  _getColor(val) {
    if (val == null) return this._nullColor;
    for (let i = this._breaks.length - 1; i >= 0; i--) {
      if (val >= this._breaks[i]) return this._colors[i];
    }
    return this._colors[0];
  },

  buildPanel() {
    const legendItems = this._colors.map((c, i) => `
      <div class="dens-item">
        <div class="dens-swatch" style="background:${c}"></div>
        <span>${this._labels[i]}</span>
      </div>`).join('');
    return `
      <div>
        <p class="panel-section-title">Densidad poblacional</p>
        <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.5rem">
          ${legendItems}
          <div class="dens-item">
            <div class="dens-swatch" style="background:${this._nullColor}"></div>
            <span>Sin dato</span>
          </div>
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

    function makePopup(p) {
      const pob  = p.pob     != null ? Number(p.pob).toLocaleString('es-AR')     + ' hab.'    : 'Sin dato';
      const dens = p.dens_pob != null ? Number(p.dens_pob).toLocaleString('es-AR') + ' hab/km²' : 'Sin dato';
      const col  = cfg._getColor(p.dens_pob);
      const txt  = (col === '#e8e0f5' || col === '#c5aee8') ? '#333' : '#fff';
      return `
        <div class="popup-inner">
          <div class="popup-id">Barrio</div>
          <div class="popup-calle">${p.Nombre}</div>
          <div class="popup-row"><span>Población</span><span>${pob}</span></div>
          <div class="popup-row">
            <span>Densidad</span>
            <span class="popup-estado" style="background:${col};color:${txt}">${dens}</span>
          </div>
        </div>`;
    }

    let barriosLayer;
    barriosLayer = L.geoJSON(BARRIOS_DATA, {
      style(feat) {
        return {
          fillColor:   cfg._getColor(feat.properties.dens_pob),
          fillOpacity: 0.75,
          color:       'rgba(255,255,255,0.7)',
          weight:      1.2,
        };
      },
      onEachFeature(feat, layer) {
        layer.bindPopup(makePopup(feat.properties), { maxWidth: 240 });
        layer.on('mouseover', function () {
          this.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 0.9 });
          this.bringToFront();
        });
        layer.on('mouseout', function () { barriosLayer.resetStyle(this); });
      },
    }).addTo(map);

    map.fitBounds(barriosLayer.getBounds(), { padding: [20, 20] });

    const feats    = BARRIOS_DATA.features;
    const pobs     = feats.map(f => f.properties.pob).filter(v => v != null);
    const total    = pobs.reduce((a, b) => a + b, 0);
    const densVals = feats.map(f => f.properties.dens_pob).filter(v => v != null);
    const maxDens  = densVals.length ? Math.max(...densVals) : null;

    document.getElementById('stats-row').innerHTML = `
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">holiday_village</span>
        Barrios: <strong>77</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">people</span>
        Población total: <strong>${pobs.length ? total.toLocaleString('es-AR') : 'Sin dato'}</strong>
      </div>
      <div class="stat-chip">
        <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-sub)">density_medium</span>
        Densidad máx.: <strong>${maxDens != null ? maxDens.toLocaleString('es-AR') + ' hab/km²' : 'Sin dato'}</strong>
      </div>`;

    const top3El = document.getElementById('barrios-top3');
    if (top3El) {
      const conDatos = feats.filter(f => f.properties.pob != null);
      if (conDatos.length === 0) {
        top3El.innerHTML = '<span style="font-size:0.78rem;font-style:italic;color:var(--text-sub)">Sin datos censales aún</span>';
      } else {
        conDatos.sort((a, b) => b.properties.pob - a.properties.pob).slice(0, 3)
          .forEach(f => {
            const p = f.properties;
            top3El.innerHTML += `<div style="display:flex;justify-content:space-between;">
              <span style="font-size:0.78rem">${p.Nombre}</span>
              <strong style="font-size:0.78rem;color:var(--text-main)">${Number(p.pob).toLocaleString('es-AR')}</strong>
            </div>`;
          });
      }
    }

    document.getElementById('showing-count').textContent = '77';
    document.getElementById('map-unit').textContent = 'barrios';
  },
};
