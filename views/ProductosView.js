import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";

export function ProductosView() {
  return `
    <div class="app-shell view-enter">
      ${Header("productos")}

      <main class="container app-main">
        <section class="hero">
          <p>Catálogo</p>
          <h1>Productos</h1>
          <p>
            Esta vista recibirá la grilla, el buscador, los filtros y la
            paginación progresiva.
          </p>
        </section>
      </main>

      ${Footer()}
    </div>
  `;
}
