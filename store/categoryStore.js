import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";
import { versionStore } from "./versionStore.js";

const CACHE_PREFIX = "tres-deseos:categorias:v1:";
const MAX_AGE_MS = 5 * 60 * 1000;
const VERSION_DEPENDENCIES = ["Categorias", "Productos", "Imagenes"];
const pendingRequests = new Map();

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
    // La tienda continúa funcionando aunque sessionStorage no esté disponible.
  }
}

function buildDetailUrl(slug, filters = {}) {
  const url = new URL(endpoints.categoriaDetalle(slug));

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function fetchAndCache(url) {
  const payload = await apiGet(url);
  const data = payload?.datos ?? null;

  if (!data) {
    throw new Error("La API no devolvió información de la categoría.");
  }

  writeCache(url, data);
  return data;
}

async function load(url, { force = false } = {}) {
  if (!force) {
    const cached = readCache(url);
    if (cached) return cached;
  }

  if (!pendingRequests.has(url)) {
    pendingRequests.set(
      url,
      fetchAndCache(url).finally(() => pendingRequests.delete(url)),
    );
  }

  return pendingRequests.get(url);
}

export const categoryStore = {
  loadDetail(slug, filters = {}, options = {}) {
    return load(buildDetailUrl(slug, filters), options);
  },

  clear() {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // La caché expira automáticamente.
    }
  },
};
