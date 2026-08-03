import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";
import { categoryStore } from "../store/categoryStore.js";
import { store } from "../store/store.js";
import { escapeHtml, safeUrl } from "../utils/dom.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";
import { getAppPathname, pushAppState } from "../utils/appPath.js";

const ORDER_OPTIONS = [
  ["predeterminado", "Orden predeterminado"],
  ["destacados", "Destacados primero"],
  ["precio_asc", "Precio: menor a mayor"],
  ["precio_desc", "Precio: mayor a menor"],
  ["nombre_asc", "Nombre: A-Z"],
  ["nombre_desc", "Nombre: Z-A"],
];

function getSlug() {
  const parts = getAppPathname().split("/").filter(Boolean);
  return decodeURIComponent(parts[1] || "");
}

function readFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    pagina: Math.max(1, Number(params.get("pagina")) || 1),
    porPagina: 12,
    buscar: params.get("buscar") || "",
    orden: params.get("orden") || "predeterminado",
  };
}

function updateUrl(slug, filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "porPagina" || value === "" || value === null || value === undefined) return;
    if (key === "pagina" && Number(value) === 1) return;
    if (key === "orden" && value === "predeterminado") return;
    params.set(key, value);
  });

  const query = params.toString();
  pushAppState(`/categoria/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`);
}

function paginationMarkup(pagination) {
  if (!pagination || pagination.totalPaginas <= 1) return "";

  return `
    <nav class="pagination" aria-label="Paginación de la categoría">
      ${pagination.tieneAnterior ? `<button class="pagination-button" type="button" data-page="${pagination.pagina - 1}">← Anterior</button>` : ""}
      <span class="pagination-status">Página ${pagination.pagina} de ${pagination.totalPaginas}</span>
      ${pagination.tieneSiguiente ? `<button class="pagination-button" type="button" data-page="${pagination.pagina + 1}">Siguiente →</button>` : ""}
    </nav>`;
}

function detailHeader(category) {
  const image = safeUrl(category.imagen || category.banner);
  const description = category.descripcion || "";
  const count = Number(category.cantidadProductos || 0);

  return `
    <section class="collection-detail-hero ${image ? "has-image" : ""}">
      <div class="collection-detail-copy">
        <a class="breadcrumb-link" href="/" data-link>← Volver al inicio</a>
        <p class="eyebrow">Categoría</p>
        <h1>${escapeHtml(category.nombre || "Categoría")}</h1>
        ${description ? `<p class="collection-detail-summary">${escapeHtml(description)}</p>` : ""}
        <span class="collection-product-count">${count} ${count === 1 ? "producto" : "productos"}</span>
      </div>
      ${image ? `
        <div class="collection-detail-image product-image">
          <img src="${image}" alt="${escapeHtml(category.nombre || "Categoría")}" loading="eager">
        </div>` : ""}
    </section>
    ${description ? `<div class="collection-description rich-text">${sanitizeHtml(description)}</div>` : ""}`;
}

export function CategoriaDetalleView() {
  const tienda = store.getState().configuracion ?? {};

  return `
    <div class="app-shell view-enter">
      ${Header("", tienda)}
      <main class="container app-main">
        <div data-category-detail>
          <section class="status-card">
            <strong>Cargando categoría…</strong>
            <p>Estamos preparando sus productos.</p>
          </section>
        </div>
      </main>
      ${Footer(tienda)}
    </div>`;
}

export async function mountCategoriaDetalleView() {
  const root = document.querySelector("[data-category-detail]");
  const slug = getSlug();
  if (!root || !slug) return;

  let filters = readFilters();

  async function load() {
    root.innerHTML = `
      <section class="status-card">
        <strong>Cargando categoría…</strong>
        <p>Estamos preparando sus productos.</p>
      </section>`;

    try {
      const data = await categoryStore.loadDetail(slug, filters);
      const category = data?.categoria ?? {};
      const productsData = data?.productos ?? {};
      const items = Array.isArray(productsData.items) ? productsData.items : [];
      const pagination = productsData.paginacion ?? {};

      root.innerHTML = `
        ${detailHeader(category)}

        <section class="section collection-products-section">
          <div class="section-heading">
            <p class="eyebrow">Explorá la categoría</p>
            <h2 class="section-title">Productos</h2>
          </div>

          <form class="catalog-filters collection-filters" data-category-form>
            <label class="catalog-field catalog-search-field">
              <span>Buscar</span>
              <input type="search" name="buscar" value="${escapeHtml(filters.buscar)}" placeholder="Nombre o descripción">
            </label>

            <label class="catalog-field">
              <span>Ordenar</span>
              <select name="orden">
                ${ORDER_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === filters.orden ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>

            <div class="catalog-filter-actions">
              <button class="button button-primary" type="submit">Aplicar filtros</button>
              <a class="button button-secondary" href="/categoria/${encodeURIComponent(slug)}" data-link>Limpiar</a>
            </div>
          </form>

          <div data-category-products>
            ${items.length ? `
              <div class="catalog-toolbar">
                <span class="catalog-count">${pagination.total} ${pagination.total === 1 ? "producto encontrado" : "productos encontrados"}</span>
                <span class="catalog-count">Página ${pagination.pagina} de ${pagination.totalPaginas}</span>
              </div>
              <div class="product-grid">${items.map(ProductCard).join("")}</div>
              ${paginationMarkup(pagination)}
            ` : `
              <div class="status-card">
                <strong>No encontramos productos con esos filtros.</strong>
                <p>Probá limpiando la búsqueda o usando otras palabras.</p>
                <a class="button button-secondary" href="/categoria/${encodeURIComponent(slug)}" data-link>Limpiar filtros</a>
              </div>`}
          </div>
        </section>`;

      bindEvents();
    } catch (error) {
      root.innerHTML = `
        <section class="status-card status-card-error">
          <strong>No pudimos cargar la categoría.</strong>
          <p>${escapeHtml(error.message || "La categoría no existe o no está disponible.")}</p>
          <div class="status-actions">
            <button class="button button-primary" type="button" data-category-retry>Reintentar</button>
            <a class="button button-secondary" href="/" data-link>Volver al inicio</a>
          </div>
        </section>`;

      root.querySelector("[data-category-retry]")?.addEventListener("click", load);
    }
  }

  function bindEvents() {
    const form = root.querySelector("[data-category-form]");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = new FormData(form);

      filters = {
        pagina: 1,
        porPagina: 12,
        buscar: String(values.get("buscar") || "").trim(),
        orden: String(values.get("orden") || "predeterminado"),
      };

      updateUrl(slug, filters);
      await load();
    });

    root.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", async () => {
        filters.pagina = Number(button.dataset.page) || 1;
        updateUrl(slug, filters);
        await load();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  await load();
}
