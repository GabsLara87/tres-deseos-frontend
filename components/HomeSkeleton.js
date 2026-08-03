import { Header } from "./Header.js";

function cards(count, className) {
  return Array.from({ length: count }, () => `<div class="${className} skeleton-card"></div>`).join("");
}

export function HomeSkeleton() {
  return `
    <div class="app-shell view-enter">
      ${Header("inicio")}

      <main class="container app-main">
        <div class="home-stack">
          <section class="hero skeleton-hero" aria-busy="true">
            <div>
              <span class="skeleton-line skeleton-line-small"></span>
              <span class="skeleton-line skeleton-line-title"></span>
              <span class="skeleton-line"></span>
              <span class="skeleton-line skeleton-line-medium"></span>
            </div>
          </section>

          <section class="section">
            <span class="skeleton-line skeleton-line-heading"></span>
            <div class="category-grid">${cards(4, "category-card")}</div>
          </section>

          <section class="section">
            <span class="skeleton-line skeleton-line-heading"></span>
            <div class="collection-grid">${cards(3, "collection-card")}</div>
          </section>

          <section class="section">
            <span class="skeleton-line skeleton-line-heading"></span>
            <div class="product-grid">${cards(4, "product-card")}</div>
          </section>
        </div>
      </main>
    </div>
  `;
}
