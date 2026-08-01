export function CollectionCard({ name, description }) {
  return `
    <a class="collection-card" href="/productos" data-link>
      <span>
        <p>${description}</p>
        <h3>${name}</h3>
      </span>
    </a>
  `;
}
