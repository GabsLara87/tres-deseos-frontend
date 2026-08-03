import { apiGet } from "../api/apiClient.js";
import { endpoints } from "../api/endpoints.js";

const STORAGE_KEY = "tres-deseos:versiones:v1";
const MIN_SYNC_INTERVAL_MS = 10 * 1000;

let currentVersions = readStoredVersions();
let lastSyncAt = 0;
let pendingRequest = null;
let timerId = null;
const listeners = new Set();

function normalizeVersions(value) {
  const result = {};

  Object.entries(value || {}).forEach(([key, version]) => {
    const numericVersion = Number(version);
    result[key] = Number.isFinite(numericVersion) && numericVersion > 0
      ? Math.floor(numericVersion)
      : 1;
  });

  return result;
}

function readStoredVersions() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return normalizeVersions(parsed?.versions || parsed);
  } catch {
    return {};
  }
}

function storeVersions(versions) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ versions, savedAt: Date.now() }),
    );
  } catch {
    // La tienda continúa funcionando aunque sessionStorage no esté disponible.
  }
}

function sameVersions(a, b) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {});
}

function notify(previous, current) {
  listeners.forEach((listener) => {
    try {
      listener({ previous, current });
    } catch (error) {
      console.error("No se pudo procesar el cambio de versiones:", error);
    }
  });
}

async function fetchVersions() {
  const payload = await apiGet(endpoints.versiones, { timeout: 12000 });
  const nextVersions = normalizeVersions(payload?.datos?.versiones || payload?.datos);
  const previousVersions = currentVersions;

  currentVersions = nextVersions;
  lastSyncAt = Date.now();
  storeVersions(nextVersions);

  if (!sameVersions(previousVersions, nextVersions)) {
    notify(previousVersions, nextVersions);
  }

  return nextVersions;
}

export const versionStore = {
  get() {
    return { ...currentVersions };
  },

  getVersion(name) {
    const value = Number(currentVersions?.[name] || 1);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  },

  signature(names = []) {
    return names
      .map((name) => `${name}:${this.getVersion(name)}`)
      .join("|");
  },

  async sync({ force = false } = {}) {
    if (!force && Date.now() - lastSyncAt < MIN_SYNC_INTERVAL_MS) {
      return this.get();
    }

    if (!pendingRequest) {
      pendingRequest = fetchVersions()
        .catch((error) => {
          console.warn("No se pudieron actualizar las versiones públicas:", error);
          return this.get();
        })
        .finally(() => {
          pendingRequest = null;
        });
    }

    return pendingRequest;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  start(intervalMs = 20000) {
    this.stop();
    timerId = window.setInterval(() => this.sync({ force: true }), intervalMs);
  },

  stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  },
};
