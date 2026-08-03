import { HomeView } from "../views/HomeView.js";
import { ProductosView, mountProductosView } from "../views/ProductosView.js";
import { ProductoDetalleView, mountProductoDetalleView } from "../views/ProductoDetalleView.js";
import { ColeccionesView, mountColeccionesView } from "../views/ColeccionesView.js";
import { CategoriaDetalleView, mountCategoriaDetalleView } from "../views/CategoriaDetalleView.js";
import { ColeccionDetalleView, mountColeccionDetalleView } from "../views/ColeccionDetalleView.js";
import { KitsView, mountKitsView } from "../views/KitsView.js";
import { KitDetalleView, mountKitDetalleView } from "../views/KitDetalleView.js";
import { NotFoundView } from "../views/NotFoundView.js";

const routes = [
  { pattern: /^\/$/, render: HomeView },
  { pattern: /^\/kits\/?$/, render: KitsView, mount: mountKitsView },
  { pattern: /^\/kits\/[^/]+\/?$/, render: KitDetalleView, mount: mountKitDetalleView },
  { pattern: /^\/productos\/?$/, render: ProductosView, mount: mountProductosView },
  { pattern: /^\/productos\/[^/]+\/?$/, render: ProductoDetalleView, mount: mountProductoDetalleView },
  { pattern: /^\/categoria\/[^/]+\/?$/, render: CategoriaDetalleView, mount: mountCategoriaDetalleView },
  { pattern: /^\/colecciones\/?$/, render: ColeccionesView, mount: mountColeccionesView },
  { pattern: /^\/colecciones\/[^/]+\/?$/, render: ColeccionDetalleView, mount: mountColeccionDetalleView },
];

let started = false;

function resolveRoute(pathname) {
  return routes.find((route) => route.pattern.test(pathname)) ?? { render: NotFoundView };
}

function navigate(url) {
  const target = new URL(url, window.location.origin);
  window.history.pushState({}, "", `${target.pathname}${target.search}${target.hash}`);
  renderCurrentRoute();

  if (!target.hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function interceptLinks(event) {
  const link = event.target.closest("a[data-link]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

  const target = new URL(href, window.location.origin);
  if (target.origin !== window.location.origin) return;

  event.preventDefault();
  navigate(`${target.pathname}${target.search}${target.hash}`);
}

function interceptSearch(event) {
  const form = event.target.closest("form.search-shell");
  if (!form) return;

  event.preventDefault();

  const formData = new FormData(form);
  const search = String(formData.get("buscar") || "").trim();
  const params = new URLSearchParams();

  if (search) {
    params.set("buscar", search);
  }

  const query = params.toString();
  navigate(`/productos${query ? `?${query}` : ""}`);
}

function renderCurrentRoute() {
  const app = document.querySelector("#app");
  const route = resolveRoute(window.location.pathname);
  app.innerHTML = route.render();

  if (typeof route.mount === "function") {
    route.mount();
  }
}

export const router = {
  start() {
    if (!started) {
      document.addEventListener("click", interceptLinks);
      document.addEventListener("submit", interceptSearch);
      window.addEventListener("popstate", renderCurrentRoute);
      started = true;
    }

    renderCurrentRoute();
  },

  render: renderCurrentRoute,
  navigate,
};
