export function SectionHeader({ eyebrow, title, description, href = "/productos" }) {
  return `
    <div class="section-header">
      <div class="section-heading">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="section-title">${title}</h2>
        <p class="section-description">${description}</p>
      </div>

      <a class="link-more" href="${href}" data-link>
        Ver más →
      </a>
    </div>
  `;
}
