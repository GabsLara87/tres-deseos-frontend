export function Footer() {
  return `
    <footer class="app-footer" id="contacto">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" data-link>
            <span class="brand-mark">TD</span>
            <span>Tres Deseos</span>
          </a>

          <p>
            Creaciones personalizadas para momentos especiales.
            Consultas y pedidos por WhatsApp.
          </p>
        </div>

        <div>
          <h3 class="footer-heading">Navegación</h3>
          <ul class="footer-list">
            <li><a href="/" data-link>Inicio</a></li>
            <li><a href="/productos" data-link>Productos</a></li>
            <li><a href="/productos?destacados=true" data-link>Destacados</a></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-heading">Contacto</h3>
          <ul class="footer-list">
            <li>WhatsApp</li>
            <li>Instagram</li>
            <li>Ushuaia</li>
          </ul>
        </div>
      </div>

      <div class="container footer-bottom">
        <small>© 2026 Tres Deseos. Todos los derechos reservados.</small>
      </div>
    </footer>
  `;
}
