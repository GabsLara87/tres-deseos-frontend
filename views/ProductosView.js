import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { ProductCard } from "../components/ProductCard.js";

const products = [
  {
    badge: "Nuevo",
    emoji: "🎊",
    category: "Banderines",
    name: "Banderín personalizado",
    summary: "Ideal para decorar cumpleaños y celebraciones.",
    price: "$ 10.000",
  },
  {
    emoji: "📔",
    category: "Agendas",
    name: "Agenda 2027",
    summary: "Organización diaria con diseño personalizado.",
    price: "$ 20.000",
  },
  {
    badge: "Destacado",
    emoji: "📷",
    category: "Fotografías",
    name: "Fotitos Polaroid",
    summary: "Tus mejores recuerdos impresos con estilo.",
    price: "$ 6.000",
  },
  {
    emoji: "⭐",
    category: "Personalizados",
    name: "Kit para regalar",
    summary: "Una combinación pensada para sorprender.",
    price: "Consultar",
  },
  {
    emoji: "🎨",
    category: "Personalizados",
    name: "Stickers temáticos",
    summary: "Diseños personalizados para diferentes ocasiones.",
    price: "$ 5.000",
  },
  {
    emoji: "🖼",
    category: "Fotografías",
    name: "Cuadro con recuerdos",
    summary: "Una composición única con tus fotografías favoritas.",
    price: "Consultar",
  },
];

export function ProductosView() {
  return `
    <div class="app-shell view-enter">
      ${Header("productos")}

      <main class="container app-main">
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Catálogo completo</p>
            <h1 class="section-title">Productos</h1>
            <p class="section-description">
              Buscá, filtrá y ordená el catálogo para encontrar lo que necesitás.
            </p>
          </div>

          <div class="catalog-layout">
            <aside class="filters-panel">
              <div class="filter-group">
                <h3>Categorías</h3>
                <label class="filter-option">
                  <input type="checkbox"> Banderines
                </label>
                <label class="filter-option">
                  <input type="checkbox"> Agendas
                </label>
                <label class="filter-option">
                  <input type="checkbox"> Fotografías
                </label>
              </div>

              <div class="filter-group">
                <h3>Colecciones</h3>
                <label class="filter-option">
                  <input type="checkbox"> Día del Niño
                </label>
                <label class="filter-option">
                  <input type="checkbox"> Cumpleaños
                </label>
              </div>

              <div class="filter-group">
                <h3>Precio</h3>
                <label class="filter-option">
                  <input type="radio" name="precio"> Todos
                </label>
                <label class="filter-option">
                  <input type="radio" name="precio"> Precio fijo
                </label>
                <label class="filter-option">
                  <input type="radio" name="precio"> Consultar
                </label>
              </div>
            </aside>

            <section>
              <div class="catalog-toolbar">
                <span class="catalog-count">6 productos encontrados</span>

                <select class="sort-select" aria-label="Ordenar productos">
                  <option>Orden predeterminado</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Nombre: A-Z</option>
                </select>
              </div>

              <div class="product-grid">
                ${products.map(ProductCard).join("")}
              </div>
            </section>
          </div>
        </section>
      </main>

      ${Footer()}
    </div>
  `;
}
