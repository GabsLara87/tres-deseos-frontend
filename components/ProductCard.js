export function ProductCard(producto) {
  return `
    <article class="product-card">
      <img
        src="${producto.imagenPrincipal || ""}"
        alt="${producto.nombre}"
        loading="lazy"
      >
      <h3>${producto.nombre}</h3>
    </article>
  `;
}
