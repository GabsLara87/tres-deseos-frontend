import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";
import { kitStore } from "../store/kitStore.js";
import { store } from "../store/store.js";
import { escapeHtml, safeUrl } from "../utils/dom.js";
import { getAppPathname } from "../utils/appPath.js";
import { formatPrice } from "../utils/formatter.js";
import { sanitizeBasicHtml } from "../utils/sanitizeHtml.js";
import { buildWhatsappConsultUrl } from "../utils/whatsapp.js";

function slugActual() {
  const match = getAppPathname().match(/^\/kits\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function renderKit(kit) {
  const image = safeUrl(kit.imagenPrincipal);
  const whatsapp = buildWhatsappConsultUrl(kit.consultaWhatsapp?.url);
  const hasSaving = Number(kit.ahorro || 0) > 0;
  const products = Array.isArray(kit.productos) ? kit.productos : [];

  return `
    <nav class="breadcrumbs" aria-label="Migas de pan">
      <a href="/" data-link>Inicio</a><span>›</span>
      <a href="/kits" data-link>Kits</a><span>›</span>
      <span>${escapeHtml(kit.nombre)}</span>
    </nav>

    <section class="kit-detail-hero">
      <div class="kit-detail-image product-image" data-lightbox-group>
        ${image ? `<img src="${image}" alt="${escapeHtml(kit.nombre)}" data-lightbox-src="${image}" data-lightbox-alt="${escapeHtml(kit.nombre)}">` : `<span class="product-placeholder">🎁</span>`}
      </div>

      <div class="kit-detail-info">
        <span class="kit-detail-label">Kit</span>
        <h1>${escapeHtml(kit.nombre)}</h1>
        ${kit.resumen ? `<p class="kit-detail-summary">${escapeHtml(kit.resumen)}</p>` : ""}
        <p class="kit-detail-includes">Incluye ${Number(kit.cantidadUnidades || products.length)} unidades en ${products.length} ${products.length === 1 ? "producto" : "productos"}.</p>

        <div class="kit-detail-price-box">
          ${hasSaving && kit.precioOriginal != null ? `<span class="kit-old-price">Por separado: ${escapeHtml(formatPrice({ tipo: "Fijo", valor: kit.precioOriginal, moneda: kit.precio?.moneda || "ARS" }))}</span>` : ""}
          <strong>${escapeHtml(formatPrice(kit.precio))}</strong>
          ${hasSaving ? `<span class="kit-saving">Ahorrás ${escapeHtml(formatPrice({ tipo: "Fijo", valor: kit.ahorro, moneda: kit.precio?.moneda || "ARS" }))} (${Number(kit.porcentajeAhorro || 0)}%)</span>` : ""}
        </div>

        <p class="product-detail-stock ${kit.disponible ? "is-available" : "is-unavailable"}">${kit.disponible ? "Disponible" : "Sin disponibilidad"}</p>
        ${whatsapp
          ? `<a class="button button-primary product-whatsapp-button" href="${whatsapp}" target="_blank" rel="noopener noreferrer">Consultar este kit por WhatsApp</a>`
          : `<button class="button button-primary product-whatsapp-button" disabled>WhatsApp no configurado</button>`}
      </div>
    </section>

    ${kit.descripcion ? `<section class="product-detail-block product-description"><h2>Descripción</h2><div class="product-description-content">${sanitizeBasicHtml(kit.descripcion)}</div></section>` : ""}

    <section class="section kit-components-section">
      <div class="section-heading"><p class="eyebrow">Todo lo que recibís</p><h2 class="section-title">Productos incluidos</h2></div>
      <div class="kit-components-list">
        ${products.map((component) => `
          <article class="kit-component-row">
            <span class="kit-component-quantity">${Number(component.cantidad || 1)}×</span>
            <div class="kit-component-card">${ProductCard(component.item)}</div>
          </article>`).join("")}
      </div>
    </section>`;
}

export function KitDetalleView() {
  const tienda = store.getState().configuracion ?? {};
  return `<div class="app-shell view-enter">${Header("kits", tienda)}<main class="container app-main"><div data-kit-detail><section class="status-card"><strong>Cargando kit…</strong><p>Estamos preparando todos los detalles.</p></section></div></main>${Footer(tienda)}</div>`;
}

export async function mountKitDetalleView() {
  const root = document.querySelector("[data-kit-detail]");
  const slug = slugActual();
  if (!root || !slug) return;

  async function load(force = false) {
    try {
      const kit = await kitStore.loadDetail(slug, { force });
      root.innerHTML = renderKit(kit);
    } catch (error) {
      root.innerHTML = `<section class="status-card status-card-error"><strong>No pudimos cargar el kit.</strong><p>${escapeHtml(error.message || "Intentá nuevamente.")}</p><div class="status-card-actions"><button class="button button-primary" type="button" data-kit-retry>Reintentar</button><a class="button button-secondary" href="/kits" data-link>Ver kits</a></div></section>`;
      root.querySelector("[data-kit-retry]")?.addEventListener("click", () => load(true));
    }
  }

  await load();
}
