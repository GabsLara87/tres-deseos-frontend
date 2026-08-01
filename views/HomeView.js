import { Header } from "../components/Header.js";
import { Footer } from "../components/Footer.js";
import { CategoryCard } from "../components/CategoryCard.js";
import { CollectionCard } from "../components/CollectionCard.js";
import { ProductCard } from "../components/ProductCard.js";
import { SectionHeader } from "../components/SectionHeader.js";

const categories = [
  { icon: "🎉", name: "Banderines", count: 12 },
  { icon: "📒", name: "Agendas", count: 8 },
  { icon: "📸", name: "Fotografías", count: 6 },
  { icon: "✨", name: "Personalizados", count: 14 },
];

const collections = [
  { name: "Día del Niño", description: "Regalos y detalles especiales" },
  { name: "Cumpleaños", description: "Decoración para celebrar" },
  { name: "Momentos únicos", description: "Recuerdos personalizados" },
];

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
];

export function HomeView() {
  return `
    <div class="app-shell view-enter">
      ${Header("inicio")}

      <main class="container app-main">
        <div class="home-stack">
          <section class="hero">
            <div>
              <p class="eyebrow">Creaciones con identidad</p>
              <h1>Tus ideas convertidas en algo único.</h1>
              <p class="hero-copy">
                Descubrí productos personalizados, detalles para regalar y
                propuestas pensadas para acompañar momentos especiales.
              </p>

              <div class="hero-actions">
                <a class="button button-primary" href="/productos" data-link>
                  Explorar productos
                </a>

                <a class="button button-secondary" href="#contacto">
                  Consultar por WhatsApp
                </a>
              </div>
            </div>

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
          </section>

          <section class="section">
            ${SectionHeader({
              eyebrow: "Explorá",
              title: "Categorías",
              description: "Encontrá rápidamente el tipo de producto que estás buscando.",
            })}

            <div class="category-grid">
              ${categories.map(CategoryCard).join("")}
            </div>
          </section>

          <section class="section">
            ${SectionHeader({
              eyebrow: "Ideas para cada ocasión",
              title: "Colecciones",
              description: "Propuestas agrupadas para descubrir productos que combinan entre sí.",
            })}

            <div class="collection-grid">
              ${collections.map(CollectionCard).join("")}
            </div>
          </section>

          <section class="section">
            ${SectionHeader({
              eyebrow: "Elegidos",
              title: "Productos destacados",
              description: "Algunas de las creaciones favoritas de la tienda.",
              href: "/productos?destacados=true",
            })}

            <div class="product-grid">
              ${products.map(ProductCard).join("")}
            </div>
          </section>

          <section class="section">
            ${SectionHeader({
              eyebrow: "Recién llegados",
              title: "Novedades",
              description: "Los últimos productos incorporados al catálogo.",
            })}

            <div class="product-grid">
              ${products.slice().reverse().map(ProductCard).join("")}
            </div>
          </section>
        </div>
      </main>

      ${Footer()}
    </div>
  `;
}
