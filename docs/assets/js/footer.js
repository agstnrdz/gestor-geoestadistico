(function () {
  const footerHTML = `
    <footer class="app-footer">
      <div class="footer-inner">

        <div class="footer-malvinas">
          <a href="https://malvinas.argentinadatos.com/" target="_blank" rel="noopener">
            <img src="https://malvinas.argentinadatos.com/strip.png" width="800" height="130" alt="Islas Malvinas Argentinas — Franja" />
          </a>
        </div>

        <div class="footer-col footer-col--left">
          <div class="footer-org">
            <span class="footer-dept">Departamento de Geoestadísticas</span>
            <span>Dirección General de Modernización e Investigación Territorial</span>
            <span>Subsecretaría de Modernización y Transparencia</span>
            <span>Secretaría de Gobierno, Modernización y Transparencia</span>
            <span class="footer-municipio">Municipio de Comodoro Rivadavia</span>
          </div>
          <div class="footer-meta">
            <span>© 2026</span>
            <span class="footer-divider">·</span>
            <a href="https://github.com/agstnrdz/gestor-geoestadistico/blob/main/LICENSE" target="_blank" rel="noopener">Licencia MIT</a>
            <span class="footer-divider">·</span>
            <a href="mailto:mit@comodoro.gov.ar">mit@comodoro.gov.ar</a>
          </div>
        </div>

        <div class="footer-col footer-col--right">
          <span class="footer-nav-label">Navegación</span>
          <nav class="footer-nav">
            <a href="index.html">Inicio</a>
            <a href="catalogo.html">Catálogo de metadatos</a>
            <a href="capas.html">Visor de mapas</a>
            <a href="relevamientos.html">Relevamientos</a>
            <a href="nomenclador.html">Nomenclador</a>
          </nav>
        </div>

      </div>
    </footer>
  `;

  const footerCSS = `
    <style id="shared-footer-style">
      body {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      body > *:not(header):not(.site-header):not(footer.app-footer) {
        flex-grow: 1;
        min-width: 0;
      }
      .app-footer {
        background: #f0f2f1;
        box-shadow: 0 -4px 18px rgba(13, 39, 80, 0.06);
        margin-top: 4rem;
        padding: 1.25rem 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.72rem;
        color: #5a5f5e;
        letter-spacing: 0.01em;
      }
      .footer-inner {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 2.5rem;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 1.25rem 2.5rem;
        align-items: start;
      }
      .footer-malvinas {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        margin-bottom: 0.25rem;
      }
      .footer-malvinas a {
        display: block;
      }
      .footer-malvinas img {
        display: block;
        width: 100%;
        max-width: 640px;
        height: auto;
        border-radius: 6px;
        opacity: 0.92;
        transition: opacity 0.2s;
      }
      .footer-malvinas img:hover {
        opacity: 1;
      }
      .footer-col--left {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .footer-org {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        border-left: 2px solid rgba(0, 106, 135, 0.25);
        padding-left: 0.75rem;
        color: #6b706f;
        line-height: 1.55;
      }
      .footer-dept {
        font-weight: 600;
        color: #3a3f3e;
      }
      .footer-municipio {
        font-weight: 600;
        color: #3a3f3e;
      }
      .footer-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        color: #7a7f7e;
      }
      .footer-meta a {
        color: #006A87;
        text-decoration: none;
        transition: opacity 0.15s;
      }
      .footer-meta a:hover {
        opacity: 0.75;
        text-decoration: underline;
      }
      .footer-divider {
        color: #b0b5b4;
      }
      .footer-col--right {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        min-width: 160px;
      }
      .footer-nav-label {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #8a8f8e;
      }
      .footer-nav {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .footer-nav a {
        color: #5a5f5e;
        text-decoration: none;
        transition: color 0.15s;
        line-height: 1.6;
      }
      .footer-nav a:hover {
        color: #006A87;
      }
      @media (max-width: 640px) {
        .footer-inner {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 0 1.25rem;
        }
      }
    </style>
  `;

  document.head.insertAdjacentHTML('beforeend', footerCSS);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
