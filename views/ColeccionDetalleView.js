import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";
import { collectionStore } from "../store/collectionStore.js";
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
    categoria: params.get("categoria") || "",
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
  pushAppState(`/colecciones/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`);
}

function paginationMarkup(pagination) {
  if (!pagination || pagination.totalPaginas <= 1) return "";

  return `
    <nav class="pagination" aria-label="Paginación de la colección">
      ${pagination.tieneAnterior ? `<button class="pagination-button" type="button" data-page="${pagination.pagina - 1}">← Anterior</button>` : ""}
      <span class="pagination-status">Página ${pagination.pagina} de ${pagination.totalPaginas}</span>
      ${pagination.tieneSiguiente ? `<button class="pagination-button" type="button" data-page="${pagination.pagina + 1}">Siguiente →</button>` : ""}
    </nav>`;
}

function categoryOptions(categories, selected) {
  return [
    `<option value="">Todas las categorías</option>`,
    ...(categories || []).map((category) => `
      <option value="${escapeHtml(category.slug || "")}" ${category.slug === selected ? "selected" : ""}>
        ${escapeHtml(category.nombre || category.slug || "")}
      </option>`),
  ].join("");
}

function detailHeader(collection) {
  const image = safeUrl(collection.banner || collection.imagen);
  const description = collection.descripcion || collection.resumen || "";

  return `
    <section class="collection-detail-hero ${image ? "has-image" : ""}">
      <div class="collection-detail-copy">
        <a class="breadcrumb-link" href="/colecciones" data-link>← Todas las temáticas</a>
        <p class="eyebrow">Colección</p>
        <h1>${escapeHtml(collection.nombre || "Colección")}</h1>
        ${collection.resumen ? `<p class="collection-detail-summary">${escapeHtml(collection.resumen)}</p>` : ""}
        <span class="collection-product-count">${Number(collection.cantidadProductos || 0)} ${Number(collection.cantidadProductos || 0) === 1 ? "producto" : "productos"}</span>
      </div>
      ${image ? `
        <div class="collection-detail-image product-image">
          <img src="${image}" alt="${escapeHtml(collection.nombre || "Colección")}">
        </div>` : ""}
    </section>
    ${description ? `<div class="collection-description rich-text">${sanitizeHtml(description)}</div>` : ""}`;
}

export function ColeccionDetalleView() {
  const tienda = store.getState().configuracion ?? {};

  return `
    <div class="app-shell view-enter">
      ${Header("colecciones", tienda)}
      <main class="container app-main">
        <div data-collection-detail>
          <section class="status-card">
            <strong>Cargando colección…</strong>
            <p>Estamos preparando sus productos.</p>
          </section>
        </div>
      </main>
      ${Footer(tienda)}
    </div>`;
}

export async function mountColeccionDetalleView() {
  const root = document.querySelector("[data-collection-detail]");
  const slug = getSlug();
  if (!root || !slug) return;

  let filters = readFilters();

  async function load() {
    root.innerHTML = `
      <section class="status-card">
        <strong>Cargando colección…</strong>
        <p>Estamos preparando sus productos.</p>
      </section>`;

    try {
      const data = await collectionStore.loadDetail(slug, filters);
      const collection = data?.coleccion ?? {};
      const productsData = data?.productos ?? {};
      const items = Array.isArray(productsData.items) ? productsData.items : [];
      const pagination = productsData.paginacion ?? {};
      const categories = store.getState().categorias || [];

      root.innerHTML = `
        ${detailHeader(collection)}

        <section class="section collection-products-section">
          <div class="section-heading">
            <p class="eyebrow">Explorá la colección</p>
            <h2 class="section-title">Productos</h2>
          </div>

          <form class="catalog-filters collection-filters" data-collection-form>
            <label class="catalog-field catalog-search-field">
              <span>Buscar</span>
              <input type="search" name="buscar" value="${escapeHtml(filters.buscar)}" placeholder="Nombre o descripción">
            </label>

            <label class="catalog-field">
              <span>Categoría</span>
              <select name="categoria">${categoryOptions(categories, filters.categoria)}</select>
            </label>

            <label class="catalog-field">
              <span>Ordenar</span>
              <select name="orden">
                ${ORDER_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === filters.orden ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>

            <div class="catalog-filter-actions">
              <button class="button button-primary" type="submit">Aplicar filtros</button>
              <a class="button button-secondary" href="/colecciones/${encodeURIComponent(slug)}" data-link>Limpiar</a>
            </div>
          </form>

          <div data-collection-products>
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
                <p>Probá limpiando la búsqueda o cambiando la categoría.</p>
                <a class="button button-secondary" href="/colecciones/${encodeURIComponent(slug)}" data-link>Limpiar filtros</a>
              </div>`}
          </div>
        </section>`;

      bindEvents();
    } catch (error) {
      root.innerHTML = `
        <section class="status-card status-card-error">
          <strong>No pudimos cargar la colección.</strong>
          <p>${escapeHtml(error.message || "La colección no existe o no está disponible.")}</p>
          <div class="status-actions">
            <button class="button button-primary" type="button" data-collection-retry>Reintentar</button>
            <a class="button button-secondary" href="/colecciones" data-link>Ver temáticas</a>
          </div>
        </section>`;

      root.querySelector("[data-collection-retry]")?.addEventListener("click", load);
    }
  }

  function bindEvents() {
    const form = root.querySelector("[data-collection-form]");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = new FormData(form);

      filters = {
        pagina: 1,
        porPagina: 12,
        buscar: String(values.get("buscar") || "").trim(),
        categoria: String(values.get("categoria") || ""),
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
