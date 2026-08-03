/**
 * Rutas lógicas conservadas para no modificar Stores ni Views.
 * apiClient.js las resuelve contra data/catalogo.json.
 */
export const API_BASE_URL = "https://datos.tres-deseos.local/api/v1";

export const endpoints = Object.freeze({
  versiones: `${API_BASE_URL}/versiones`,
  inicio: `${API_BASE_URL}/inicio`,
  configuracion: `${API_BASE_URL}/configuracion`,
  categorias: `${API_BASE_URL}/categorias`,
  colecciones: `${API_BASE_URL}/colecciones`,
  kits: `${API_BASE_URL}/kits`,
  productos: `${API_BASE_URL}/productos`,

  categoriaDetalle(slug) {
    return `${API_BASE_URL}/categorias/${encodeURIComponent(slug)}`;
  },

  coleccionDetalle(slug) {
    return `${API_BASE_URL}/colecciones/${encodeURIComponent(slug)}`;
  },

  kitDetalle(slug) {
    return `${API_BASE_URL}/kits/${encodeURIComponent(slug)}`;
  },

  productoDetalle(slug) {
    return `${API_BASE_URL}/productos/${encodeURIComponent(slug)}`;
  },
});
