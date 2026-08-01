export function ProductCard(producto) {
  return `
    <article class="product-card">
      ${producto.badge ? `<span class="product-badge">${producto.badge}</span>` : ""}

      <div class="product-image">${producto.emoji}</div>

      <div class="product-card-body">
        <p class="product-category">${producto.category}</p>
        <h3>${producto.name}</h3>
        <p class="product-summary">${producto.summary}</p>

        <div class="product-footer">
          <span class="product-price">${producto.price}</span>

          <div class="product-actions">
            <button class="icon-button" type="button" aria-label="Agregar a favoritos">
              ♡
            </button>
            <button class="icon-button" type="button" aria-label="Consultar producto">
              💬
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
