(function () {

  const css = `
    <style id="shared-header-style">
      html { scrollbar-gutter: stable; }

      .site-header {
        position: sticky;
        top: 0;
        z-index: 1001;
      }
      .site-header-top {
        background: #134768;
        box-shadow: 0 2px 0 rgba(255,255,255,0.08);
        padding: 1.1rem 0;
      }
      .header-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 2.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .header-title {
        font-size: 1.2rem;
        font-weight: 500;
        color: #dedede;
        letter-spacing: -0.3px;
        line-height: 1.25;
        text-decoration: none;
      }
      .header-title small {
        display: block;
        font-size: 0.8rem;
        font-weight: 400;
        color: rgba(255,255,255,0.6);
        margin-top: 0.15rem;
      }
      .header-logo-slot { height: 44px; min-width: 44px; }

      .site-header-nav {
        background: #0f3a57;
      }
      .tabbar-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 2.5rem;
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .tabbar-inner::-webkit-scrollbar { display: none; }
      .tabbar-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        font-weight: 400;
        color: rgba(255,255,255,0.6);
        text-decoration: none;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        transition: color 0.18s, border-color 0.18s, background 0.18s;
      }
      .tabbar-tab .tab-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 15px;
        font-weight: 300;
        line-height: 1;
      }
      .tabbar-tab:hover {
        color: rgba(255,255,255,0.9);
        background: rgba(255,255,255,0.06);
      }
      .tabbar-tab.active {
        color: #ffffff;
        font-weight: 500;
        border-bottom-color: rgba(255,255,255,0.5);
      }
      @media (max-width: 700px) {
        .header-inner    { padding: 0 1.25rem; }
        .tabbar-inner    { padding: 0 0.5rem; }
        .tabbar-tab      { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
      }
    </style>
  `;

  const TABS = [
    { label: 'Sobre el proyecto', href: 'sobre-el-proyecto.html', icon: 'info' },
    { label: 'Metodología',       href: 'metodologia.html',       icon: 'science' },
    { label: 'Datos / Descargas', href: 'descargas.html',         icon: 'download' },
  ];

  const path = window.location.pathname;
  const currentFile = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const tabsHTML = TABS.map(t => {
    const active = currentFile === t.href;
    return `<a href="${t.href}" class="tabbar-tab${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>
      <span class="tab-icon material-symbols-outlined" aria-hidden="true">${t.icon}</span>${t.label}</a>`;
  }).join('');

  const html = `
    <header class="site-header">
      <div class="site-header-top">
        <div class="header-inner">
          <a class="header-title" href="index.html">
            Departamento de Geoestadísticas
            <small>Dirección General de Modernización e Investigación Territorial</small>
          </a>
          <div class="header-logo-slot">
            <a href="https://comodoro.gov.ar/miciudad" target="_blank" rel="noopener">
              <img src="assets/img/logotipo_MCR_DGMIT_blanco.png" alt="Logotipo DGMIT" style="height:52px;width:auto;display:block;" />
            </a>
          </div>
        </div>
      </div>
      <nav class="site-header-nav" aria-label="Navegación institucional">
        <div class="tabbar-inner">${tabsHTML}</div>
      </nav>
    </header>
  `;

  document.head.insertAdjacentHTML('beforeend', css);
  document.body.insertAdjacentHTML('afterbegin', html);

})();
