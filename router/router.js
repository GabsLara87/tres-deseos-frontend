import { HomeView } from "../views/HomeView.js";
import { ProductosView } from "../views/ProductosView.js";
import { NotFoundView } from "../views/NotFoundView.js";

const routes = [
  { pattern: /^\/$/, render: HomeView },
  { pattern: /^\/productos\/?$/, render: ProductosView },
];

function resolveRoute(pathname) {
  return routes.find((route) => route.pattern.test(pathname)) ?? {
    render: NotFoundView,
  };
}

function navigate(url) {
  window.history.pushState({}, "", url);
  renderCurrentRoute();
}

function interceptLinks(event) {
  const link = event.target.closest("a[data-link]");
  if (!link) return;

  event.preventDefault();
  navigate(link.getAttribute("href"));
}

function renderCurrentRoute() {
  const app = document.querySelector("#app");
  const route = resolveRoute(window.location.pathname);
  app.innerHTML = route.render();
}

export const router = {
  start() {
    document.addEventListener("click", interceptLinks);
    window.addEventListener("popstate", renderCurrentRoute);
    renderCurrentRoute();
  },
  navigate,
};
