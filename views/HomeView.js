import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CategoryCard } from "../components/CategoryCard.js";
import { CollectionCard } from "../components/CollectionCard.js";
import { ProductCard } from "../components/ProductCard.js";
import { KitCard } from "../components/KitCard.js";
import { SectionHeader } from "../components/SectionHeader.js";
import { HomeSkeleton } from "../components/HomeSkeleton.js";
import { homeStore } from "../store/homeStore.js";
import { escapeHtml, safeUrl } from "../utils/dom.js";

function sectionItems(section) {
  return Array.isArray(section?.items) ? section.items : [];
}

function renderProductsSection({
  section,
  eyebrow,
  title,
  description,
  fallbackUrl,
}) {
  const items = sectionItems(section);

  if (!items.length) {
    return "";
  }

  return `
    <section class="section">
      ${SectionHeader({
        eyebrow,
        title,
        description,
        href: safeUrl(section?.url, fallbackUrl),
      })}

      <div class="product-grid">
        ${items.map((product) => ProductCard(product, { imageLinksToDetail: true })).join("")}
      </div>
    </section>
  `;
}

export function HomeView() {
  const home = homeStore.get();

  if (!home) {
    return HomeSkeleton();
  }

  const tienda = home.tienda ?? {};
  const negocio = tienda.negocio ?? {};
  const identidad = tienda.identidad ?? {};
  const contacto = tienda.contacto ?? {};

  const categories = sectionItems(home.categorias);
  const collections = sectionItems(home.colecciones);
  const kits = sectionItems(home.kits);
  const whatsappUrl = safeUrl(contacto.whatsapp?.urlBase);
  const coverUrl = safeUrl(identidad.portadaUrl);
  const heroStyle = coverUrl
    ? `style="--hero-cover: url('${coverUrl}')"`
    : "";

  return `
    <div class="app-shell view-enter">
      ${Header("inicio", tienda)}

      <main class="container app-main">
        <div class="home-stack">
          <section class="hero ${coverUrl ? "hero-with-cover" : ""}" ${heroStyle}>
            <div class="hero-content">
              <p class="eyebrow">${escapeHtml(negocio.eslogan || "Creaciones con identidad")}</p>
              <h1>${escapeHtml(negocio.nombre || "Tres Deseos")}</h1>

              ${
                negocio.descripcion
                  ? `<p class="hero-copy">${escapeHtml(negocio.descripcion)}</p>`
                  : ""
              }

              <div class="hero-actions">
                <a class="button button-primary" href="/productos" data-link>
                  Explorar productos
                </a>

                ${
                  whatsappUrl
                    ? `<a class="button button-secondary" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>`
                    : ""
                }
              </div>
            </div>

            ${
              coverUrl
                ? `<div class="hero-cover" aria-hidden="true"></div>`
                : `
                  <div class="hero-visual" aria-hidden="true">
                    <article class="hero-card hero-card-main">
                      <div class="hero-card-image">🎁</div>
                      <div class="hero-card-body">
                        <p>Creación destacada</p>
                        <strong>Diseños personalizados</strong>
                      </div>
                    </article>

                    <article class="hero-card hero-card-small">
                      <div class="hero-card-image">✨</div>
                      <div class="hero-card-body">
                        <strong>Hecho con dedicación</strong>
                      </div>
                    </article>
                  </div>
                `
            }
          </section>

          ${
            categories.length
              ? `
                <section class="section">
                  ${SectionHeader({
                    eyebrow: "Explorá",
                    title: "Categorías",
                    description: "Encontrá rápidamente el tipo de producto que estás buscando.",
                    href: "/productos",
                    showMore: false,
                  })}

                  <div class="category-grid">
                    ${categories.map(CategoryCard).join("")}
                  </div>
                </section>
              `
              : ""
          }

          ${
            collections.length
              ? `
                <section class="section">
                  ${SectionHeader({
                    eyebrow: "Ideas para cada ocasión",
                    title: "Temáticas",
                    description: "Encontrá productos agrupados por personaje, ocasión o estilo.",
                    href: safeUrl(home.colecciones?.url, "/productos"),
                  })}

                  <div class="collection-grid">
                    ${collections.map(CollectionCard).join("")}
                  </div>
                </section>
              `
              : ""
          }

          ${
            kits.length
              ? `
                <section class="section home-kits-section">
                  ${SectionHeader({
                    eyebrow: "Llevate todo junto",
                    title: "Kits recomendados",
                    description: "Combinaciones listas para resolver tu pedido y aprovechar un mejor precio.",
                    href: "/kits",
                  })}
                  <div class="kit-grid">${kits.map((kit) => KitCard(kit, { imageLinksToDetail: true })).join("")}</div>
                </section>`
              : ""
          }

          ${renderProductsSection({
            section: home.productosDestacados,
            eyebrow: "Elegidos",
            title: "Productos destacados",
            description: "Algunas de las creaciones favoritas de la tienda.",
            fallbackUrl: "/productos?destacados=true",
          })}

          ${renderProductsSection({
            section: home.novedades,
            eyebrow: "Recién llegados",
            title: "Novedades",
            description: "Los últimos productos incorporados al catálogo.",
            fallbackUrl: "/productos",
          })}
        </div>
      </main>

      ${Footer(tienda)}
    </div>
  `;
}
