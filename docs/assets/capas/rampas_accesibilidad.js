window.CAPA_CONFIG = {

  id:          'rampas_accesibilidad',
  titulo:      'Rampas de <span>accesibilidad</span>',
  nombreCorto: 'Rampas de accesibilidad',
  desc:        'Rampas de accesibilidad — Comodoro Rivadavia. 789 registros relevados.',
  esTest:      false,

  dataScripts: ['assets/data/rampas_data.js'],

  _toId(estado) {
    return estado.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  },

  buildPanel() {
    const cfg = window.CAPA_CONFIG;
    const estados = [
      { key: 'Óptimo',   color: '#27ae60' },
      { key: 'Bueno',    color: '#2471a3' },
      { key: 'Mejorar',  color: '#e08c00' },
      { key: 'Pintado',  color: '#8e44ad' },
      { key: 'Sin dato', color: '#95a5a6' },
    ];

    const conteos = {};
    estados.forEach(e => { conteos[e.key] = 0; });
    if (typeof RAMPAS_DATA !== 'undefined') {
      RAMPAS_DATA.features.forEach(f => {
        const e = (f.properties.estado || '').trim() || 'Sin dato';
        if (Object.prototype.hasOwnProperty.call(conteos, e)) conteos[e]++;
      });
    }

    const btns = estados
      .filter(({ key }) => conteos[key] > 0)
      .map(({ key, color }) => `
      <button class="layer-btn active" data-estado="${key}" onclick="capaToggleEstado(this)" aria-pressed="true">
        <span class="dot" style="background:${color}" aria-hidden="true"></span>
        ${key} <span class="count" id="cnt-${cfg._toId(key)}">${conteos[key]}</span>
      </button>`).join('');

    return `
      <div>
        <p class="panel-section-title">Estado de rampa</p>
        ${btns}
      </div>

      <div>
        <p class="panel-section-title">Filtrar por barrio</p>
        <div class="select-wrap">
          <select class="filter-select" id="barrio-select" onchange="capaApplyFilters()" aria-label="Filtrar por barrio">
            <option value="">Todos los barrios</option>
          </select>
        </div>
      </div>

      <button class="btn-clear" onclick="capaClearFilters()">Limpiar filtros</button>
    `;
  },

  buildStats(container) {
    container.innerHTML = '';
  },

  init(map) {
    const cfg = window.CAPA_CONFIG;

    const COLORES = {
      'Óptimo':   '#27ae60',
      'Bueno':    '#2471a3',
      'Mejorar':  '#e08c00',
      'Pintado':  '#8e44ad',
      'Sin dato': '#95a5a6',
    };

    function getEstado(p) {
      const e = (p.estado || '').trim();
      return e || 'Sin dato';
    }

    function makePopup(p, estado) {
      const color = COLORES[estado] || COLORES['Sin dato'];
      return `
        <div class="popup-inner">
          <div class="popup-id">${p.id || '—'}</div>
          <div class="popup-calle">${p.calle || '—'}</div>
          <div class="popup-inter">esq. ${p.interseccion || '—'}</div>
          <div class="popup-row"><span>Barrio</span><span>${p.barrio || '—'}</span></div>
          <div class="popup-row"><span>Posee rampa</span><span>${p.posee_rampa || '—'}</span></div>
          <div class="popup-row">
            <span>Estado</span>
            <span class="popup-estado" style="background:${color}">${estado}</span>
          </div>
          ${p.obs ? `<div class="popup-row"><span>Obs.</span><span>${p.obs}</span></div>` : ''}
        </div>`;
    }

    if (typeof BARRIOS_DATA !== 'undefined') {
      L.geoJSON(BARRIOS_DATA, {
        style: {
          color: '#222222', weight: 0.8,
          opacity: 0.5, fillColor: 'transparent', fillOpacity: 0,
        },
        interactive: false,
      }).addTo(map);
    }

    const layerGroup   = L.layerGroup().addTo(map);
    const allMarkers   = [];
    let estadosActivos = new Set(Object.keys(COLORES));
    let barrioActivo   = '';

    RAMPAS_DATA.features.forEach(f => {
      const p      = f.properties;
      const estado = getEstado(p);
      const color  = COLORES[estado] || COLORES['Sin dato'];
      const [lng, lat] = f.geometry.coordinates;

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        color: 'rgba(255,255,255,0.8)',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      }).bindPopup(makePopup(p, estado), { maxWidth: 260 });

      marker._estado = estado;
      marker._barrio = p.barrio || '';
      allMarkers.push(marker);
      layerGroup.addLayer(marker);
    });

    const conteos = {};
    Object.keys(COLORES).forEach(k => { conteos[k] = 0; });
    allMarkers.forEach(m => { conteos[m._estado] = (conteos[m._estado] || 0) + 1; });

    Object.keys(COLORES).forEach(estado => {
      const el = document.getElementById('cnt-' + cfg._toId(estado));
      if (el) el.textContent = conteos[estado] || 0;
    });

    document.getElementById('stats-row').innerHTML = Object.entries(COLORES).map(([estado, color]) => `
      <div class="stat-chip">
        <span class="dot" style="background:${color}"></span>
        ${estado}: <strong>${conteos[estado] || 0}</strong>
      </div>`).join('');

    const barrios = [...new Set(allMarkers.map(m => m._barrio).filter(Boolean))].sort();
    const sel = document.getElementById('barrio-select');
    if (sel) {
      barrios.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b; opt.textContent = b;
        sel.appendChild(opt);
      });
    }

    document.getElementById('showing-count').textContent = allMarkers.length;
    document.getElementById('map-unit').textContent = 'puntos';

    window.capaApplyFilters = function () {
      barrioActivo = document.getElementById('barrio-select')?.value || '';
      layerGroup.clearLayers();
      let count = 0;
      allMarkers.forEach(m => {
        const ok = estadosActivos.has(m._estado) &&
                   (!barrioActivo || m._barrio === barrioActivo);
        if (ok) { layerGroup.addLayer(m); count++; }
      });
      document.getElementById('showing-count').textContent = count;
    };

    window.capaToggleEstado = function (btn) {
      const estado = btn.dataset.estado;
      if (estadosActivos.has(estado)) {
        estadosActivos.delete(estado);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        estadosActivos.add(estado);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      capaApplyFilters();
    };

    window.capaClearFilters = function () {
      estadosActivos = new Set(Object.keys(COLORES));
      barrioActivo   = '';
      const sel = document.getElementById('barrio-select');
      if (sel) sel.value = '';
      document.querySelectorAll('[data-estado]').forEach(b => {
        b.classList.add('active');
        b.setAttribute('aria-pressed', 'true');
      });
      capaApplyFilters();
    };
  },
};
