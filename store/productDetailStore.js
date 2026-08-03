import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";
import { versionStore } from "./versionStore.js";

const CACHE_PREFIX = "tres-deseos:producto:v2:";
const MAX_AGE_MS = 5 * 60 * 1000;
const VERSION_DEPENDENCIES = [
  "Productos",
  "Categorias",
  "Colecciones",
  "Modalidades",
  "Imagenes",
  "CamposPersonalizados",
  "ValoresAtributos",
];
const pendingRequests = new Map();

function versionSignature() {
  return versionStore.signature(VERSION_DEPENDENCIES);
}

function cacheKey(slug) {
  return `${CACHE_PREFIX}${slug}`;
}

function readCache(slug) {
  try {
    const key = cacheKey(slug);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.savedAt || !cached?.value) return null;

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

function writeCache(slug, value) {
  try {
    sessionStorage.setItem(
      cacheKey(slug),
      JSON.stringify({
        value,
        versionSignature: versionSignature(),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // La vista continúa funcionando aunque sessionStorage no esté disponible.
  }
}

async function fetchProduct(slug) {
  const payload = await apiGet(endpoints.productoDetalle(slug));
  const product = payload?.datos?.item ?? null;

  if (!product) {
    throw new Error("El producto solicitado no está disponible.");
  }

  writeCache(slug, product);
  return product;
}

export const productDetailStore = {
  async load(slug, { force = false } = {}) {
    const normalizedSlug = String(slug || "").trim().toLowerCase();

    if (!normalizedSlug) {
      throw new Error("No se indicó qué producto querés consultar.");
    }

    if (!force) {
      const cached = readCache(normalizedSlug);
      if (cached) return cached;
    }

    if (!pendingRequests.has(normalizedSlug)) {
      pendingRequests.set(
        normalizedSlug,
        fetchProduct(normalizedSlug).finally(() => {
          pendingRequests.delete(normalizedSlug);
        }),
      );
    }

    return pendingRequests.get(normalizedSlug);
  },

  clear(slug) {
    try {
      if (slug) {
        sessionStorage.removeItem(cacheKey(String(slug).trim().toLowerCase()));
        return;
      }

      Object.keys(sessionStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Sin acción.
    }
  },
};
