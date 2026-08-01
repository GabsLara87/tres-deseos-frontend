export function Header(activePage = "") {
  return `
    <header class="app-header">
      <div class="container header-top">
        <a class="brand" href="/" data-link>
          <span class="brand-mark">TD</span>
          <span class="brand-copy">
            <span>Tres Deseos</span>
            <small>Tus ideas, mis creaciones.</small>
          </span>
        </a>

        <form class="search-shell" role="search">
          <input
            class="search-input"
            type="search"
            placeholder="Buscar productos, categorías o colecciones..."
            aria-label="Buscar en la tienda"
          >
          <button class="search-button" type="submit" aria-label="Buscar">
            🔍
          </button>
        </form>

        <div class="header-actions">
          <button class="icon-button" type="button" aria-label="Favoritos">
            ♡
          </button>

          <button class="icon-button cart-button" type="button" aria-label="Carrito">
            🛍
            <span class="cart-badge">0</span>
          </button>
        </div>
      </div>

      <div class="header-bottom">
        <nav class="container header-bottom-inner" aria-label="Navegación principal">
          <a class="nav-link" href="/" data-link
            ${activePage === "inicio" ? 'aria-current="page"' : ""}>
            Inicio
          </a>

          <a class="nav-link" href="/productos" data-link
            ${activePage === "productos" ? 'aria-current="page"' : ""}>
            Productos
          </a>

          <a class="nav-link" href="/productos?categoria=banderines" data-link>
            Banderines
          </a>

          <a class="nav-link" href="/productos?coleccion=dia-del-nino" data-link>
            Colecciones
          </a>

          <a class="nav-link" href="#contacto">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  `;
}
