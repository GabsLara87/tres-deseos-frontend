import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";

export function HomeView() {
  return `
    <div class="app-shell view-enter">
      ${Header("inicio")}

      <main class="container app-main">
        <section class="hero">
          <p>Tienda pública</p>
          <h1>Tres Deseos</h1>
          <p>
            El frontend ya está conectado a su estructura inicial.
            En el próximo sprint cargaremos los datos reales de la API.
          </p>

          <a class="button" href="/productos" data-link>
            Ver productos
          </a>
        </section>

        <section class="section">
          <div class="status-card">
            <strong>Frontend inicial funcionando.</strong>
            <p>Router, Store y cliente API preparados.</p>
          </div>
        </section>
      </main>

      ${Footer()}
    </div>
  `;
}
