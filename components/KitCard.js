import { escapeHtml, safeUrl } from "../utils/dom.js";
import { formatPrice } from "../utils/formatter.js";

export function KitCard(kit) {
  const image = safeUrl(kit.imagenPrincipal);
  const url = safeUrl(kit.url, `/kits/${encodeURIComponent(kit.slug || "")}`);
  const hasSaving = Number(kit.ahorro || 0) > 0;

  return `
    <article class="kit-card">
      ${hasSaving ? `<span class="kit-badge">Ahorrás ${escapeHtml(formatPrice({ tipo: "Fijo", valor: kit.ahorro, moneda: kit.precio?.moneda || "ARS" }))}</span>` : `<span class="kit-badge">Kit</span>`}

      <button class="kit-image product-image product-image-button" type="button" data-lightbox-src="${image}" data-lightbox-alt="${escapeHtml(kit.nombre)}" aria-label="Ampliar imagen de ${escapeHtml(kit.nombre)}">
        ${image
          ? `<img src="${image}" alt="${escapeHtml(kit.nombre)}" loading="lazy">`
          : `<span class="product-placeholder">🎁</span>`}
      </button>

      <div class="kit-card-body">
        <p class="product-category">${Number(kit.cantidadUnidades || kit.cantidadProductos || 0)} productos incluidos</p>
        <h3><a href="${url}" data-link>${escapeHtml(kit.nombre)}</a></h3>
        ${kit.resumen ? `<p class="product-summary">${escapeHtml(kit.resumen)}</p>` : ""}

        <div class="kit-price-row">
          <strong>${escapeHtml(formatPrice(kit.precio))}</strong>
          ${hasSaving && kit.precioOriginal != null
            ? `<span>${escapeHtml(formatPrice({ tipo: "Fijo", valor: kit.precioOriginal, moneda: kit.precio?.moneda || "ARS" }))}</span>`
            : ""}
        </div>

        <a class="button button-secondary kit-card-button" href="${url}" data-link>Ver kit</a>
      </div>
    </article>`;
}
