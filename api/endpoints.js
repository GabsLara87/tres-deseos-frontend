export const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbxsD-zNiSYm1RRnzFIkQQa9J3bIBHgb52ZGDTRDVFRavLjDOiOcx1sapRFuDuRemCi_/exec/api/v1";

export const endpoints = Object.freeze({
  inicio: `${API_BASE_URL}/inicio`,
  configuracion: `${API_BASE_URL}/configuracion`,
  categorias: `${API_BASE_URL}/categorias`,
  colecciones: `${API_BASE_URL}/colecciones`,
  productos: `${API_BASE_URL}/productos`,
});
