import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";
import { catalogStore } from "../store/catalogStore.js";
import { store } from "../store/store.js";
import { escapeHtml } from "../utils/dom.js";

const ORDER_OPTIONS = [
  ["predeterminado", "Orden predeterminado"],
  ["destacados", "Destacados primero"],
  ["precio_asc", "Precio: menor a mayor"],
  ["precio_desc", "Precio: mayor a menor"],
  ["nombre_asc", "Nombre: A-Z"],
  ["nombre_desc", "Nombre: Z-A"],
];

function readFilters() {
  const params = new URLSearchParams(window.location.search);

  return {
    pagina: Math.max(1, Number(params.get("pagina")) || 1),
    porPagina: 12,
    buscar: params.get("buscar") || "",
    categoria: params.get("categoria") || "",
    coleccion: params.get("coleccion") || "",
    destacados: params.get("destacados") || "",
    orden: params.get("orden") || "predeterminado",
  };
}

function optionsMarkup(items, selected, placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items.map((item) => {
      const value = item.slug || "";
      return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(item.nombre || value)}</option>`;
    }),
  ].join("");
}

function paginationMarkup(pagination) {
  if (!pagination || pagination.totalPaginas <= 1) {
    return "";
  }

  const buttons = [];

  if (pagination.tieneAnterior) {
    buttons.push(`<button class="pagination-button" type="button" data-page="${pagination.pagina - 1}">← Anterior</button>`);
  }

  buttons.push(`<span class="pagination-status">Página ${pagination.pagina} de ${pagination.totalPaginas}</span>`);

  if (pagination.tieneSiguiente) {
    buttons.push(`<button class="pagination-button" type="button" data-page="${pagination.pagina + 1}">Siguiente →</button>`);
  }

  return `<nav class="pagination" aria-label="Paginación del catálogo">${buttons.join("")}</nav>`;
}

function updateUrl(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (key !== "porPagina" && value !== "" && value !== null && value !== undefined) {
      if (!(key === "pagina" && Number(value) === 1) && !(key === "orden" && value === "predeterminado")) {
        params.set(key, value);
      }
    }
  });

  const query = params.toString();
  window.history.pushState({}, "", `/productos${query ? `?${query}` : ""}`);
}

export function ProductosView() {
  const state = store.getState();
  const tienda = state.configuracion ?? {};
  const filters = readFilters();

  return `
    <div class="app-shell view-enter">
      ${Header("productos", tienda)}

      <main class="container app-main">
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Catálogo completo</p>
            <h1 class="section-title">Catálogo</h1>
            <p class="section-description">Buscá, filtrá y ordená el catálogo para encontrar lo que necesitás.</p>
          </div>

          <form class="catalog-filters catalog-filters-compact" data-catalog-form>
            <label class="catalog-field">
              <span>Categoría</span>
              <select name="categoria">
                ${optionsMarkup(state.categorias || [], filters.categoria, "Todas las categorías")}
              </select>
            </label>

            <label class="catalog-field">
              <span>Temática</span>
              <select name="coleccion">
                ${optionsMarkup(state.colecciones || [], filters.coleccion, "Todas las temáticas")}
              </select>
            </label>

            <label class="catalog-field">
              <span>Ordenar</span>
              <select name="orden">
                ${ORDER_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === filters.orden ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>

            <div class="catalog-filter-actions">
              <button class="button button-primary" type="submit">Aplicar</button>
              <a class="button button-secondary" href="/productos" data-link>Limpiar</a>
            </div>
          </form>

          <div data-catalog-results>
            <div class="status-card"><strong>Cargando productos…</strong><p>Estamos preparando el catálogo.</p></div>
          </div>
        </section>
      </main>

      ${Footer(tienda)}
    </div>
  `;
}

export async function mountProductosView() {
  const results = document.querySelector("[data-catalog-results]");
  const form = document.querySelector("[data-catalog-form]");

  if (!results || !form) {
    return;
  }

  async function load(filters) {
    results.innerHTML = `<div class="status-card"><strong>Cargando productos…</strong><p>Estamos preparando el catálogo.</p></div>`;

    try {
      const data = await catalogStore.loadProducts(filters);
      const items = Array.isArray(data?.items) ? data.items : [];
      const pagination = data?.paginacion ?? {};

      if (!items.length) {
        results.innerHTML = `
          <div class="status-card">
            <strong>No encontramos productos.</strong>
            <p>Probá cambiando o limpiando los filtros seleccionados.</p>
            <a class="button button-secondary" href="/productos" data-link>Ver todo el catálogo</a>
          </div>`;
        return;
      }

      results.innerHTML = `
        <div class="catalog-toolbar">
          <span class="catalog-count">${pagination.total} ${pagination.total === 1 ? "producto encontrado" : "productos encontrados"}</span>
          <span class="catalog-count">Página ${pagination.pagina} de ${pagination.totalPaginas}</span>
        </div>
        <div class="product-grid">${items.map(ProductCard).join("")}</div>
        ${paginationMarkup(pagination)}
      `;
    } catch (error) {
      results.innerHTML = `
        <div class="status-card status-card-error">
          <strong>No pudimos cargar el catálogo.</strong>
          <p>${escapeHtml(error.message || "Intentá nuevamente.")}</p>
          <button class="button button-primary" type="button" data-catalog-retry>Reintentar</button>
        </div>`;
    }
  }

  let filters = readFilters();
  await load(filters);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = new FormData(form);

    filters = {
      pagina: 1,
      porPagina: 12,
      buscar: filters.buscar,
      categoria: String(values.get("categoria") || ""),
      coleccion: String(values.get("coleccion") || ""),
      destacados: "",
      orden: String(values.get("orden") || "predeterminado"),
    };

    updateUrl(filters);
    await load(filters);
  });

  results.addEventListener("click", async (event) => {
    const pageButton = event.target.closest("[data-page]");
    const retryButton = event.target.closest("[data-catalog-retry]");

    if (pageButton) {
      filters.pagina = Number(pageButton.dataset.page) || 1;
      updateUrl(filters);
      await load(filters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (retryButton) {
      await load(filters);
    }
  });
}
