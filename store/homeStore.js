import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";
import { versionStore } from "./versionStore.js";
import { store } from "./store.js";

const SESSION_KEY = "tres-deseos:inicio:v2";
const MAX_AGE_MS = 5 * 60 * 1000;
const VERSION_DEPENDENCIES = [
  "Configuracion",
  "Categorias",
  "Colecciones",
  "Productos",
  "Imagenes",
  "Kits",
];

let pendingRequest = null;
let currentSignature = "";

function expectedSignature() {
  return versionStore.signature(VERSION_DEPENDENCIES);
}

function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached?.savedAt || !cached?.value) return null;

    if (Date.now() - cached.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    if (cached.versionSignature !== expectedSignature()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeSessionCache(value, versionSignature) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ value, versionSignature, savedAt: Date.now() }),
    );
  } catch {
    // La tienda continúa funcionando aunque sessionStorage no esté disponible.
  }
}

function updateGlobalStore(home, versionSignature) {
  currentSignature = versionSignature;

  store.setState({
    appReady: true,
    home,
    configuracion: home.tienda ?? null,
    categorias: home.categorias?.items ?? [],
    colecciones: home.colecciones?.items ?? [],
    kits: home.kits?.items ?? [],
  });
}

async function fetchHome() {
  const payload = await apiGet(endpoints.inicio);
  const home = payload.datos;
  const signature = expectedSignature();

  writeSessionCache(home, signature);
  updateGlobalStore(home, signature);

  return home;
}

export const homeStore = {
  async load({ force = false } = {}) {
    const signature = expectedSignature();
    const current = store.getState().home;

    if (!force && current && currentSignature === signature) {
      return current;
    }

    if (!force) {
      const cached = readSessionCache();

      if (cached) {
        updateGlobalStore(cached.value, cached.versionSignature);
        return cached.value;
      }
    }

    if (!pendingRequest) {
      pendingRequest = fetchHome().finally(() => {
        pendingRequest = null;
      });
    }

    return pendingRequest;
  },

  get() {
    return store.getState().home;
  },

  clear() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Sin acción.
    }

    currentSignature = "";
    store.setState({
      appReady: false,
      home: null,
      configuracion: null,
      categorias: [],
      colecciones: [],
      kits: [],
    });
  },
};
