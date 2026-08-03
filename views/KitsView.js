import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { KitCard } from "../components/KitCard.js";
import { kitStore } from "../store/kitStore.js";
import { store } from "../store/store.js";
import { escapeHtml } from "../utils/dom.js";

export function KitsView() {
  const tienda = store.getState().configuracion ?? {};
  return `
    <div class="app-shell view-enter">
      ${Header("kits", tienda)}
      <main class="container app-main">
        <section class="kits-intro">
          <p class="eyebrow">Todo resuelto en un solo pedido</p>
          <h1>Kits</h1>
          <p>Combinaciones preparadas para que lleves varios productos juntos y aproveches un mejor precio.</p>
        </section>
        <div data-kits-list>
          <section class="status-card"><strong>Cargando kits…</strong><p>Estamos preparando las opciones disponibles.</p></section>
        </div>
      </main>
      ${Footer(tienda)}
    </div>`;
}

export async function mountKitsView() {
  const root = document.querySelector("[data-kits-list]");
  if (!root) return;

  try {
    const data = await kitStore.loadAll();
    const items = Array.isArray(data?.items) ? data.items : [];
    root.innerHTML = items.length
      ? `<div class="kit-grid">${items.map(KitCard).join("")}</div>`
      : `<section class="status-card"><strong>Todavía no hay kits publicados.</strong><p>Podés seguir explorando el catálogo completo.</p><a class="button button-primary" href="/productos" data-link>Ver catálogo</a></section>`;
  } catch (error) {
    root.innerHTML = `<section class="status-card status-card-error"><strong>No pudimos cargar los kits.</strong><p>${escapeHtml(error.message || "Intentá nuevamente.")}</p><button class="button button-primary" type="button" data-kit-retry>Reintentar</button></section>`;
    root.querySelector("[data-kit-retry]")?.addEventListener("click", () => {
      kitStore.clear();
      mountKitsView();
    });
  }
}
