import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";

export function NotFoundView() {
  return `
    <div class="app-shell view-enter">
      ${Header()}

      <main class="container app-main">
        <section class="hero">
          <p>Error 404</p>
          <h1>Página no encontrada</h1>
          <a class="button" href="/" data-link>Volver al inicio</a>
        </section>
      </main>

      ${Footer()}
    </div>
  `;
}
