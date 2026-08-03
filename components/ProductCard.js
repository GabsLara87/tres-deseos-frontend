import { escapeHtml, safeUrl } from "../utils/dom.js";
import { formatPrice } from "../utils/formatter.js";

export function ProductCard(product) {
  const image = safeUrl(product.imagenPrincipal);
  const url = safeUrl(product.url, `/productos/${encodeURIComponent(product.slug || "")}`);
  const categoryName = product.categoria?.nombre || "Producto";
  const badge = product.destacado ? "Destacado" : "";

  return `
    <article class="product-card">
      ${badge ? `<span class="product-badge">${badge}</span>` : ""}

      <button class="product-image product-image-button" type="button" data-lightbox-src="${image}" data-lightbox-alt="${escapeHtml(product.nombre)}" aria-label="Ampliar imagen de ${escapeHtml(product.nombre)}">
        ${
          image
            ? `<img src="${image}" alt="${escapeHtml(product.nombre)}" loading="lazy">`
            : `<span class="product-placeholder">🎁</span>`
        }
      </button>

      <div class="product-card-body">
        <p class="product-category">${escapeHtml(categoryName)}</p>

        <h3>
          <a href="${url}" data-link>${escapeHtml(product.nombre)}</a>
        </h3>

        <p class="product-summary">
          ${escapeHtml(product.resumen || "Creación personalizada.")}
        </p>

        <div class="product-footer">
          <span class="product-price">${escapeHtml(formatPrice(product.precio))}</span>

          <div class="product-actions">
            <button class="icon-button" type="button" aria-label="Agregar a favoritos">
              ♡
            </button>

            <a class="icon-button" href="${url}" data-link aria-label="Ver producto">
              →
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}
