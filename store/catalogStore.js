import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";
import { versionStore } from "./versionStore.js";

const CACHE_PREFIX = "tres-deseos:catalogo:v2:";
const MAX_AGE_MS = 5 * 60 * 1000;
const VERSION_DEPENDENCIES = ["Productos", "Categorias", "Colecciones", "Imagenes"];
const pendingRequests = new Map();

function buildProductsUrl(filters = {}) {
  const url = new URL(endpoints.productos);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function versionSignature() {
  return versionStore.signature(VERSION_DEPENDENCIES);
}

function cacheKey(url) {
  return `${CACHE_PREFIX}${encodeURIComponent(url)}`;
}

function readCache(url) {
  try {
    const key = cacheKey(url);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);

    if (!cached?.savedAt || cached?.value === undefined) {
      sessionStorage.removeItem(key);
      return null;
    }

    if (
      Date.now() - cached.savedAt > MAX_AGE_MS ||
      cached.versionSignature !== versionSignature()
    ) {
      sessionStorage.removeItem(key);
      return null;
    }

    return cached.value;
  } catch {
    return null;
  }
}

function writeCache(url, value) {
  try {
    sessionStorage.setItem(
      cacheKey(url),
      JSON.stringify({
        value,
        versionSignature: versionSignature(),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // El catálogo continúa funcionando aunque sessionStorage no esté disponible.
  }
}

async function fetchProducts(url) {
  const payload = await apiGet(url);
  const data = payload?.datos ?? null;

  if (!data) {
    throw new Error("La API no devolvió los datos del catálogo.");
  }

  writeCache(url, data);
  return data;
}

export const catalogStore = {
  async loadProducts(filters = {}, { force = false } = {}) {
    const url = buildProductsUrl(filters);

    if (!force) {
      const cached = readCache(url);
      if (cached) return cached;
    }

    if (!pendingRequests.has(url)) {
      pendingRequests.set(
        url,
        fetchProducts(url).finally(() => {
          pendingRequests.delete(url);
        }),
      );
    }

    return pendingRequests.get(url);
  },

  clear() {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Sin acción: la caché expira sola.
    }
  },
};
