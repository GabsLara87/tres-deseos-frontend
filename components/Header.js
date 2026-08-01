export function Header(activePage = "") {
  return `
    <header class="app-header">
      <div class="container header-inner">
        <a class="brand" href="/" data-link>
          <span class="brand-mark">TD</span>
          <span>Tres Deseos</span>
        </a>

        <nav aria-label="Navegación principal">
          <div class="nav-list">
            <a class="nav-link" href="/" data-link
              ${activePage === "inicio" ? 'aria-current="page"' : ""}>
              Inicio
            </a>

            <a class="nav-link" href="/productos" data-link
              ${activePage === "productos" ? 'aria-current="page"' : ""}>
              Productos
            </a>
          </div>
        </nav>
      </div>
    </header>
  `;
}
