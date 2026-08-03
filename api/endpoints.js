export const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxsD-zNiSYm1RRnzFIkQQa9J3bIBHgb52ZGDTRDVFRavLjDOiOcx1sapRFuDuRemCi_/exec/api/v1";

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
