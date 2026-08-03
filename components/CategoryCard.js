import { escapeHtml, safeUrl } from "../utils/dom.js";

export function CategoryCard(category) {
  const url = `/categoria/${encodeURIComponent(category.slug || "")}`;
  const image = safeUrl(category.imagen);

  return `
    <a class="category-card ${image ? "category-card-image" : ""}" href="${url}" data-link
      ${image ? `style="--category-image: url('${image}')"` : ""}>
      <span class="category-icon">${escapeHtml(category.icono || "✨")}</span>

      <span class="category-copy">
        <strong>${escapeHtml(category.nombre)}</strong>
        <small>${Number(category.cantidadProductos || 0)} productos</small>
      </span>
    </a>
  `;
}
