import { escapeHtml, safeUrl } from "../utils/dom.js";

export function Header(activePage = "", tienda = {}) {
  const negocio = tienda.negocio ?? {};
  const identidad = tienda.identidad ?? {};
  const contacto = tienda.contacto ?? {};
  const logoUrl = safeUrl(identidad.logoUrl);
  const whatsappUrl = safeUrl(contacto.whatsapp?.urlBase);

  return `
    <header class="app-header">
      <input
        class="mobile-nav-checkbox"
        type="checkbox"
        id="mobile-nav-checkbox"
        aria-hidden="true"
        tabindex="-1"
      >

      <div class="container header-top">
        <a class="brand" href="/" data-link>
          ${
            logoUrl
              ? `<img class="brand-logo" src="${logoUrl}" alt="${escapeHtml(negocio.nombre || "Tres Deseos")}">`
              : `<span class="brand-mark">TD</span>`
          }

          <span class="brand-copy">
            <span>${escapeHtml(negocio.nombre || "Tres Deseos")}</span>
            <small>${escapeHtml(negocio.eslogan || "Tus ideas, mis creaciones.")}</small>
          </span>
        </a>

        <form class="search-shell" role="search" action="/productos">
          <input
            class="search-input"
            type="search"
            name="buscar"
            placeholder="Buscar productos o temáticas..."
            aria-label="Buscar en la tienda"
          >
          <button class="search-button" type="submit" aria-label="Buscar">
            🔍
          </button>
        </form>

        <div class="header-actions">
          <button class="icon-button favorite-button" type="button" aria-label="Favoritos" title="Favoritos">
            ♡
          </button>

          <button class="icon-button cart-button" type="button" aria-label="Carrito" title="Carrito">
            🛍
            <span class="cart-badge">0</span>
          </button>

          <label
            class="mobile-nav-toggle"
            for="mobile-nav-checkbox"
            role="button"
            aria-label="Abrir o cerrar menú de navegación"
            title="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </label>
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
            Catálogo
          </a>

          <a class="nav-link" href="/colecciones" data-link
            ${activePage === "colecciones" ? 'aria-current="page"' : ""}>
            Temáticas
          </a>

          ${
            whatsappUrl
              ? `<a class="nav-link" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`
              : `<a class="nav-link" href="#contacto">Contacto</a>`
          }
        </nav>
      </div>
    </header>
  `;
}
