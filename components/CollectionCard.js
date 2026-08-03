import { escapeHtml, safeUrl } from "../utils/dom.js";

export function CollectionCard(collection) {
  const url = safeUrl(collection.url, `/colecciones/${encodeURIComponent(collection.slug || "")}`);
  const image = safeUrl(
    collection.imagen ||
    collection.imagenUrl ||
    collection.portada ||
    collection.portadaUrl ||
    collection.banner ||
    collection.bannerUrl
  );
  const description = collection.descripcion || collection.resumen || "";
  const total = Number(collection.cantidadProductos || 0);

  return `
    <a class="collection-card" href="${url}" data-link
      ${image ? `style="--collection-image: url('${image}')"` : ""}>
      <span>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        <h3>${escapeHtml(collection.nombre)}</h3>
        ${total > 0 ? `<small>${total} ${total === 1 ? "producto" : "productos"}</small>` : ""}
      </span>
    </a>
  `;
}
