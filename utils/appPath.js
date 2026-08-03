/**
 * Resuelve la carpeta base de la aplicación a partir de la ubicación real
 * de este módulo. Funciona sin cambios en:
 * - Live Server / localhost (base vacía)
 * - GitHub Pages (/tres-deseos-frontend)
 * - Cloudflare Pages o dominio propio (base vacía)
 */
const appRootUrl = new URL("../", import.meta.url);

export const APP_BASE_PATH = appRootUrl.pathname.replace(/\/$/, "");

export function getAppPathname(pathname = window.location.pathname) {
  if (APP_BASE_PATH && pathname.startsWith(APP_BASE_PATH)) {
    return pathname.slice(APP_BASE_PATH.length) || "/";
  }

  return pathname || "/";
}

export function toAppUrl(url = "/") {
  const target = new URL(url, window.location.origin);
  let pathname = target.pathname;

  if (APP_BASE_PATH && pathname.startsWith(APP_BASE_PATH)) {
    pathname = pathname.slice(APP_BASE_PATH.length) || "/";
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  return `${APP_BASE_PATH}${pathname}${target.search}${target.hash}` || "/";
}

/**
 * Convierte href/action internos escritos desde la raíz lógica de la SPA
 * a rutas reales de la publicación. Esto también permite abrir enlaces en
 * una pestaña nueva en GitHub Pages sin salir del repositorio.
 */
export function normalizeAppLinks(root = document) {
  root.querySelectorAll('a[data-link][href]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const target = new URL(href, window.location.origin);
    if (target.origin !== window.location.origin) return;

    link.setAttribute("href", toAppUrl(`${target.pathname}${target.search}${target.hash}`));
  });

  root.querySelectorAll("form.search-shell[action]").forEach((form) => {
    const action = form.getAttribute("action");
    if (!action) return;
    form.setAttribute("action", toAppUrl(action));
  });
}

export function pushAppState(url) {
  window.history.pushState({}, "", toAppUrl(url));
}

export function replaceAppState(url) {
  window.history.replaceState({}, "", toAppUrl(url));
}
