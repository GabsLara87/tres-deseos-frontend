import { router } from "../../router/router.js";
import { homeStore } from "../../store/homeStore.js";
import { catalogStore } from "../../store/catalogStore.js";
import { productDetailStore } from "../../store/productDetailStore.js";
import { collectionStore } from "../../store/collectionStore.js";
import { categoryStore } from "../../store/categoryStore.js";
import { kitStore } from "../../store/kitStore.js";
import { versionStore } from "../../store/versionStore.js";
import { applyTheme } from "../../utils/theme.js";
import { initImageLightbox } from "../../components/ImageLightbox.js";

let handlingVersionChange = false;

function restoreGithubPagesRoute() {
  const savedRoute = sessionStorage.getItem("github-pages-spa-route");
  if (!savedRoute) return;

  sessionStorage.removeItem("github-pages-spa-route");
  window.history.replaceState({}, "", savedRoute);
}

// GitHub Pages redirige las rutas internas mediante 404.html. Restauramos la
// URL recién después de cargar este módulo y todas sus dependencias, para que
// los archivos relativos se resuelvan desde la raíz real de la aplicación.
restoreGithubPagesRoute();

async function refreshCurrentViewAfterVersionChange() {
  if (handlingVersionChange) return;
  handlingVersionChange = true;

  try {
    homeStore.clear();
    catalogStore.clear();
    productDetailStore.clear();
    collectionStore.clear();
    categoryStore.clear();
    kitStore.clear();

    // La configuración contiene la paleta elegida en el panel.
    // Se vuelve a cargar siempre, aunque el usuario esté en Productos,
    // Categorías o en el detalle de un producto.
    const inicio = await homeStore.load({ force: true });
    applyTheme(inicio.tienda?.apariencia);

    router.render();
  } catch (error) {
    console.warn("No se pudo refrescar automáticamente la vista:", error);
  } finally {
    handlingVersionChange = false;
  }
}

initImageLightbox();

async function bootstrap() {
  const app = document.querySelector("#app");

  try {
    router.start();

    // Primero validamos las versiones. Si el panel cambió algún dato,
    // las cachés viejas del navegador dejan de ser válidas inmediatamente.
    await versionStore.sync({ force: true });

    const inicio = await homeStore.load();

    applyTheme(inicio.tienda?.apariencia);
    router.render();

    versionStore.subscribe(({ previous, current }) => {
      if (Object.keys(previous || {}).length === 0) return;
      if (JSON.stringify(previous) === JSON.stringify(current)) return;
      refreshCurrentViewAfterVersionChange();
    });

    // Revisión liviana en segundo plano. No bloquea la navegación.
    versionStore.start(20000);
  } catch (error) {
    console.error("No se pudo iniciar la tienda:", error);

    app.innerHTML = `
      <main class="container app-main">
        <section class="status-card status-card-error">
          <strong>No pudimos cargar la tienda.</strong>
          <p>${error.message || "Actualizá la página o intentá nuevamente más tarde."}</p>
          <button class="button button-primary" type="button" data-retry-home>
            Reintentar
          </button>
        </section>
      </main>
    `;
  }
}

document.addEventListener("click", async (event) => {
  const retryButton = event.target.closest("[data-retry-home]");

  if (!retryButton) return;

  retryButton.disabled = true;
  retryButton.textContent = "Reintentando…";

  homeStore.clear();
  catalogStore.clear();
  productDetailStore.clear();
  collectionStore.clear();
  categoryStore.clear();
  await bootstrap();
});

bootstrap();
