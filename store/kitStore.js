import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";
import { versionStore } from "./versionStore.js";

const CACHE_PREFIX = "tres-deseos:kits:v1:";
const MAX_AGE_MS = 5 * 60 * 1000;
const VERSION_DEPENDENCIES = ["Kits", "Productos", "Categorias", "Imagenes", "Configuracion"];
const pendingRequests = new Map();

function signature() {
  return versionStore.signature(VERSION_DEPENDENCIES);
}

function key(url) {
  return `${CACHE_PREFIX}${encodeURIComponent(url)}`;
}

function read(url) {
  try {
    const raw = sessionStorage.getItem(key(url));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.savedAt || cached?.value === undefined) return null;
    if (Date.now() - cached.savedAt > MAX_AGE_MS || cached.signature !== signature()) {
      sessionStorage.removeItem(key(url));
      return null;
    }
    return cached.value;
  } catch {
    return null;
  }
}

function write(url, value) {
  try {
    sessionStorage.setItem(key(url), JSON.stringify({ value, signature: signature(), savedAt: Date.now() }));
  } catch {
    // La tienda sigue funcionando sin sessionStorage.
  }
}

async function load(url, { force = false } = {}) {
  if (!force) {
    const cached = read(url);
    if (cached) return cached;
  }

  if (!pendingRequests.has(url)) {
    pendingRequests.set(url, apiGet(url)
      .then((payload) => {
        const value = payload?.datos ?? null;
        if (!value) throw new Error("La API no devolvió información de kits.");
        write(url, value);
        return value;
      })
      .finally(() => pendingRequests.delete(url)));
  }

  return pendingRequests.get(url);
}

export const kitStore = {
  loadAll(options = {}) {
    return load(endpoints.kits, options);
  },

  async loadDetail(slug, options = {}) {
    const data = await load(endpoints.kitDetalle(slug), options);
    const item = data?.item ?? null;
    if (!item) throw new Error("El kit solicitado no está disponible.");
    return item;
  },

  clear() {
    try {
      Object.keys(sessionStorage)
        .filter((name) => name.startsWith(CACHE_PREFIX))
        .forEach((name) => sessionStorage.removeItem(name));
    } catch {
      // Sin acción.
    }
  },
};
