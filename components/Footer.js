import { escapeHtml, safeUrl } from "../utils/dom.js";

export function Footer(tienda = {}) {
  const negocio = tienda.negocio ?? {};
  const contacto = tienda.contacto ?? {};
  const redes = tienda.redes ?? {};
  const identidad = tienda.identidad ?? {};

  const logoUrl = safeUrl(identidad.logoUrl);
  const whatsappUrl = safeUrl(contacto.whatsapp?.urlBase);
  const instagramUrl = safeUrl(redes.instagram);
  const facebookUrl = safeUrl(redes.facebook);
  const tiktokUrl = safeUrl(redes.tiktok);

  return `
    <footer class="app-footer" id="contacto">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" data-link>
            ${
              logoUrl
                ? `<img class="brand-logo" src="${logoUrl}" alt="${escapeHtml(negocio.nombre || "Tres Deseos")}">`
                : `<span class="brand-mark">TD</span>`
            }
            <span>${escapeHtml(negocio.nombre || "Tres Deseos")}</span>
          </a>

          ${
            negocio.descripcion
              ? `<p>${escapeHtml(negocio.descripcion)}</p>`
              : ""
          }
        </div>

        <div>
          <h3 class="footer-heading">Navegación</h3>
          <ul class="footer-list">
            <li><a href="/" data-link>Inicio</a></li>
            <li><a href="/productos" data-link>Catálogo</a></li>
            <li><a href="/colecciones" data-link>Temáticas</a></li>
            <li><a href="/productos?destacados=true" data-link>Destacados</a></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Contacto</h3>
          <ul class="footer-list">
            ${whatsappUrl ? `<li><a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>` : ""}
            ${instagramUrl ? `<li><a href="${instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a></li>` : ""}
            ${facebookUrl ? `<li><a href="${facebookUrl}" target="_blank" rel="noopener noreferrer">Facebook</a></li>` : ""}
            ${tiktokUrl ? `<li><a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer">TikTok</a></li>` : ""}
            ${contacto.email ? `<li><a href="mailto:${escapeHtml(contacto.email)}">${escapeHtml(contacto.email)}</a></li>` : ""}
            ${contacto.direccion ? `<li>${escapeHtml(contacto.direccion)}</li>` : ""}
            ${contacto.horarios ? `<li>${escapeHtml(contacto.horarios)}</li>` : ""}
          </ul>
        </div>
      </div>

      <div class="container footer-bottom">
        <small>© ${new Date().getFullYear()} ${escapeHtml(negocio.nombre || "Tres Deseos")}. Todos los derechos reservados.</small>
      </div>
    </footer>
  `;
}
