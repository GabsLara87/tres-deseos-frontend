const state = {
  appReady: false,
  configuracion: null,
  categorias: [],
  colecciones: [],
  productos: new Map(),
  carrito: [],
  favoritos: [],
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(state));
}

export const store = {
  getState() {
    return state;
  },

  setState(partialState) {
    Object.assign(state, partialState);
    notify();
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
