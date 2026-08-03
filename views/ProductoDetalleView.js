import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";
import { KitCard } from "../components/KitCard.js";
import { productDetailStore } from "../store/productDetailStore.js";
import { store } from "../store/store.js";
import { escapeHtml, safeUrl } from "../utils/dom.js";
import { getAppPathname } from "../utils/appPath.js";
import { formatPrice } from "../utils/formatter.js";
import { sanitizeBasicHtml } from "../utils/sanitizeHtml.js";

function getSlug() {
  const match = getAppPathname().match(/^\/productos\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function galleryMarkup(product) {
  const images = [product.imagenPrincipal, ...(product.galeria || [])]
    .map((url) => safeUrl(url))
    .filter(Boolean);

  if (!images.length) {
    return `
      <div class="product-detail-placeholder" aria-label="Producto sin imagen">
        <span>🎁</span>
      </div>`;
  }

  return `
    <div class="product-detail-gallery" data-product-gallery data-lightbox-group>
      <div class="product-detail-main-image">
        <img src="${images[0]}" alt="${escapeHtml(product.nombre)}" data-gallery-main data-lightbox-src="${images[0]}" data-lightbox-alt="${escapeHtml(product.nombre)}">
      </div>
      ${
        images.length > 1
          ? `<div class="product-detail-thumbnails">
              ${images
                .map(
                  (url, index) => `
                    <button class="product-thumbnail ${index === 0 ? "is-active" : ""}" type="button" data-gallery-image="${url}" data-lightbox-src="${url}" data-lightbox-alt="${escapeHtml(product.nombre)} - imagen ${index + 1}" aria-label="Ver imagen ${index + 1}">
                      <img src="${url}" alt="" loading="lazy">
                    </button>`,
                )
                .join("")}
            </div>`
          : ""
      }
    </div>`;
}

function tagsMarkup(product) {
  const tags = [];

  if (product.categoria?.nombre) {
    tags.push(`<a href="${safeUrl(product.categoria.url, "/productos")}" data-link>${escapeHtml(product.categoria.nombre)}</a>`);
  }

  (product.colecciones || []).forEach((collection) => {
    tags.push(`<a href="${safeUrl(collection.url, "/productos")}" data-link>${escapeHtml(collection.nombre)}</a>`);
  });

  return tags.length ? `<div class="product-detail-tags">${tags.join("")}</div>` : "";
}

function modalitiesMarkup(modalities) {
  if (!Array.isArray(modalities) || !modalities.length) return "";

  return `
    <section class="product-detail-block">
      <h2>Modalidades disponibles</h2>
      <div class="product-modalities">
        ${modalities
          .map(
            (item) => `
              <article class="product-modality">
                <div>
                  <strong>${escapeHtml(item.nombre)}</strong>
                  ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ""}
                </div>
                ${item.precio ? `<span>${escapeHtml(formatPrice({ tipo: "Fijo", ...item.precio }))}</span>` : ""}
              </article>`,
          )
          .join("")}
      </div>
    </section>`;
}

function attributesMarkup(attributes) {
  if (!Array.isArray(attributes) || !attributes.length) return "";

  return `
    <section class="product-detail-block">
      <h2>Características</h2>
      <dl class="product-attributes">
        ${attributes
          .map(
            (attribute) => `
              <div>
                <dt>${escapeHtml(attribute.nombre || "Detalle")}</dt>
                <dd>${escapeHtml(attribute.valor ?? "-")}</dd>
              </div>`,
          )
          .join("")}
      </dl>
    </section>`;
}

function renderProduct(product) {
  const safeDescription = sanitizeBasicHtml(product.descripcion);
  const whatsappUrl = safeUrl(product.consultaWhatsapp?.url);
  const stockText = product.disponible ? "Disponible" : "Sin disponibilidad";

  return `
    <nav class="breadcrumbs" aria-label="Migas de pan">
      <a href="/" data-link>Inicio</a>
      <span>›</span>
      <a href="/productos" data-link>Productos</a>
      <span>›</span>
      <span>${escapeHtml(product.nombre)}</span>
    </nav>

    <section class="product-detail-layout">
      ${galleryMarkup(product)}

      <div class="product-detail-info">
        ${tagsMarkup(product)}
        ${product.destacado ? `<span class="product-detail-badge">Destacado</span>` : ""}
        <h1>${escapeHtml(product.nombre)}</h1>
        ${product.resumen ? `<p class="product-detail-summary">${escapeHtml(product.resumen)}</p>` : ""}
        <p class="product-detail-price">${escapeHtml(formatPrice(product.precio))}</p>
        <p class="product-detail-stock ${product.disponible ? "is-available" : "is-unavailable"}">${stockText}</p>

        ${
          whatsappUrl
            ? `<a class="button button-primary product-whatsapp-button" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>`
            : `<button class="button button-primary product-whatsapp-button" type="button" disabled>WhatsApp no configurado</button>`
        }

        <p class="product-detail-help">La consulta no confirma la compra. La vendedora te responderá con disponibilidad, personalización y entrega.</p>
      </div>
    </section>

    ${
      safeDescription
        ? `<section class="product-detail-block product-description"><h2>Descripción</h2><div class="product-description-content">${safeDescription}</div></section>`
        : ""
    }

    ${modalitiesMarkup(product.modalidades)}
    ${attributesMarkup(product.atributos)}

    ${
      Array.isArray(product.kits) && product.kits.length
        ? `<section class="section product-kits-section">
            <div class="section-heading">
              <p class="eyebrow">Llevate todo junto</p>
              <h2 class="section-title">Este producto forma parte de</h2>
            </div>
            <div class="kit-grid compact-kit-grid">${product.kits.map(KitCard).join("")}</div>
          </section>`
        : ""
    }

    ${
      Array.isArray(product.relacionados) && product.relacionados.length
        ? `<section class="section product-related-section">
            <div class="section-heading">
              <p class="eyebrow">También pueden interesarte</p>
              <h2 class="section-title">Productos relacionados</h2>
            </div>
            <div class="product-grid">${product.relacionados.map(ProductCard).join("")}</div>
          </section>`
        : ""
    }
  `;
}

export function ProductoDetalleView() {
  const tienda = store.getState().configuracion ?? {};

  return `
    <div class="app-shell view-enter">
      ${Header("productos", tienda)}
      <main class="container app-main">
        <div data-product-detail>
          <div class="status-card"><strong>Cargando producto…</strong><p>Estamos preparando todos los detalles.</p></div>
        </div>
      </main>
      ${Footer(tienda)}
    </div>`;
}

export async function mountProductoDetalleView() {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  const slug = getSlug();

  async function load({ force = false } = {}) {
    container.innerHTML = `<div class="status-card"><strong>Cargando producto…</strong><p>Estamos preparando todos los detalles.</p></div>`;

    try {
      const product = await productDetailStore.load(slug, { force });
      container.innerHTML = renderProduct(product);
    } catch (error) {
      container.innerHTML = `
        <div class="status-card status-card-error">
          <strong>No pudimos cargar el producto.</strong>
          <p>${escapeHtml(error.message || "Intentá nuevamente.")}</p>
          <div class="status-card-actions">
            <button class="button button-primary" type="button" data-product-retry>Reintentar</button>
            <a class="button button-secondary" href="/productos" data-link>Volver al catálogo</a>
          </div>
        </div>`;
    }
  }

  await load();

  container.addEventListener("click", async (event) => {
    const thumbnail = event.target.closest("[data-gallery-image]");
    const retry = event.target.closest("[data-product-retry]");

    if (thumbnail) {
      const main = container.querySelector("[data-gallery-main]");
      if (main) {
        main.src = thumbnail.dataset.galleryImage;
        main.dataset.lightboxSrc = thumbnail.dataset.galleryImage;
        main.dataset.lightboxAlt = thumbnail.dataset.lightboxAlt || main.alt;
        container.querySelectorAll(".product-thumbnail").forEach((button) => button.classList.remove("is-active"));
        thumbnail.classList.add("is-active");
      }
    }

    if (retry) {
      productDetailStore.clear(slug);
      await load({ force: true });
    }
  });
}
