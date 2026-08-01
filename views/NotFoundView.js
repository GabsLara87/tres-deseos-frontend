import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";

export function NotFoundView() {
  return `
    <div class="app-shell view-enter">
      ${Header()}

      <main class="container app-main">
        <section class="hero">
          <div>
            <p class="eyebrow">Error 404</p>
            <h1>Página no encontrada</h1>
            <p class="hero-copy">
              La dirección que intentaste abrir no existe.
            </p>
            <a class="button button-primary" href="/" data-link>
              Volver al inicio
            </a>
          </div>
        </section>
      </main>

      ${Footer()}
    </div>
  `;
}
