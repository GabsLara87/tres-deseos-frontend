const cache = new Map();

export function cacheGet(key) {
  return cache.get(key);
}

export function cacheSet(key, value) {
  cache.set(key, { value, savedAt: Date.now() });
}

export function cacheHas(key) {
  return cache.has(key);
}

export function cacheClear() {
  cache.clear();
}
