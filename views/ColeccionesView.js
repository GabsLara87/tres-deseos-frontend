import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CollectionCard } from "../components/CollectionCard.js";
import { collectionStore } from "../store/collectionStore.js";
import { store } from "../store/store.js";
import { escapeHtml } from "../utils/dom.js";

export function ColeccionesView() {
  const tienda = store.getState().configuracion ?? {};

  return `
    <div class="app-shell view-enter">
      ${Header("colecciones", tienda)}

      <main class="container app-main thematic-page">
        <section class="thematic-hero">
          <div class="thematic-hero-copy">
            <p class="eyebrow">Elegí el universo que más te gusta</p>
            <h1>Temáticas</h1>
            <p>
              Encontrá productos reunidos por personaje, ocasión o estilo.
              Entrá a una temática y descubrí todas las propuestas relacionadas.
            </p>
            <div class="thematic-hero-actions">
              <a class="button button-primary" href="#tematicas-disponibles">Explorar temáticas</a>
              <a class="button button-secondary" href="/productos" data-link>Ver catálogo completo</a>
            </div>
          </div>

          <div class="thematic-hero-decoration" aria-hidden="true">
            <span>🎨</span>
            <span>✨</span>
            <span>🎁</span>
          </div>
        </section>

        <section class="section thematic-list-section" id="tematicas-disponibles">
          <div class="section-heading collection-page-heading">
            <p class="eyebrow">Descubrí propuestas</p>
            <h2 class="section-title">Temáticas disponibles</h2>
            <p class="section-description">
              Cada temática reúne productos que combinan entre sí para que encuentres ideas más rápido.
            </p>
          </div>

          <div data-collections-results>
            <div class="status-card">
              <strong>Cargando temáticas…</strong>
              <p>Estamos preparando las propuestas disponibles.</p>
            </div>
          </div>
        </section>
      </main>

      ${Footer(tienda)}
    </div>
  `;
}

export async function mountColeccionesView() {
  const results = document.querySelector("[data-collections-results]");
  if (!results) return;

  async function load() {
    results.innerHTML = `
      <div class="status-card">
        <strong>Cargando temáticas…</strong>
        <p>Estamos preparando las propuestas disponibles.</p>
      </div>`;

    try {
      const data = await collectionStore.loadAll();
      // Acepta el contrato actual { items: [...] } y también el arreglo directo
      // que pudo quedar guardado en sessionStorage por una versión anterior.
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      if (!items.length) {
        results.innerHTML = `
          <div class="status-card thematic-empty-state">
            <strong>Todavía no hay temáticas publicadas.</strong>
            <p>Mientras tanto, podés recorrer todo el catálogo disponible.</p>
            <a class="button button-primary" href="/productos" data-link>Ver catálogo</a>
          </div>`;
        return;
      }

      const helperCard = items.length < 4
        ? `
          <a class="thematic-catalog-card" href="/productos" data-link>
            <span class="thematic-catalog-icon" aria-hidden="true">🛍️</span>
            <span>
              <small>¿Querés ver todo junto?</small>
              <strong>Explorá el catálogo completo</strong>
              <p>Usá los filtros para buscar por tipo de producto o temática.</p>
            </span>
            <b aria-hidden="true">→</b>
          </a>`
        : "";

      results.innerHTML = `
        <div class="catalog-toolbar collection-toolbar">
          <span class="catalog-count">${items.length} ${items.length === 1 ? "temática disponible" : "temáticas disponibles"}</span>
        </div>
        <div class="collection-grid collection-list-grid ${items.length < 4 ? "collection-list-grid-compact" : ""}">
          ${items.map(CollectionCard).join("")}
          ${helperCard}
        </div>`;
    } catch (error) {
      results.innerHTML = `
        <div class="status-card status-card-error">
          <strong>No pudimos cargar las temáticas.</strong>
          <p>${escapeHtml(error.message || "Intentá nuevamente.")}</p>
          <button class="button button-primary" type="button" data-collections-retry>Reintentar</button>
        </div>`;
    }
  }

  results.addEventListener("click", (event) => {
    if (event.target.closest("[data-collections-retry]")) {
      load();
    }
  });

  await load();
}
