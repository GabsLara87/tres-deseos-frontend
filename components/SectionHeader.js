import { escapeHtml, safeUrl } from "../utils/dom.js";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href = "/productos",
  showMore = true,
}) {
  return `
    <div class="section-header">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2 class="section-title">${escapeHtml(title)}</h2>
        <p class="section-description">${escapeHtml(description)}</p>
      </div>

      ${
        showMore
          ? `<a class="link-more" href="${safeUrl(href, "/productos")}" data-link>Ver más →</a>`
          : ""
      }
    </div>
  `;
}
