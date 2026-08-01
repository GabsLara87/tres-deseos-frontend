export function CategoryCard({ icon, name, count }) {
  return `
    <a class="category-card" href="/productos?categoria=${name.toLowerCase()}" data-link>
      <span class="category-icon">${icon}</span>
      <span>
        <strong>${name}</strong>
        <small>${count} productos</small>
      </span>
    </a>
  `;
}
