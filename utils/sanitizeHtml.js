const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "BR",
  "P",
  "UL",
  "OL",
  "LI",
]);

const BLOCKED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "SVG",
  "MATH",
  "NOSCRIPT",
  "TEMPLATE",
]);

/**
 * Sanitiza HTML básico recibido desde la API.
 *
 * Solo conserva etiquetas de formato seguras y elimina todos los atributos.
 * Las etiquetas no permitidas conservan su texto interno, excepto aquellas
 * cuyo contenido puede ser ejecutable o peligroso, que se descartan completas.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeHtml(value) {
  const source = String(value ?? "").trim();
  if (!source) return "";

  const template = document.createElement("template");
  template.innerHTML = source;

  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createDocumentFragment();
    }

    const tagName = node.tagName.toUpperCase();

    if (BLOCKED_TAGS.has(tagName)) {
      return document.createDocumentFragment();
    }

    const output = ALLOWED_TAGS.has(tagName)
      ? document.createElement(tagName.toLowerCase())
      : document.createDocumentFragment();

    Array.from(node.childNodes).forEach((child) => {
      output.appendChild(sanitizeNode(child));
    });

    return output;
  };

  const safeContainer = document.createElement("div");
  Array.from(template.content.childNodes).forEach((node) => {
    safeContainer.appendChild(sanitizeNode(node));
  });

  return safeContainer.innerHTML;
}

// Alias temporal para no romper vistas antiguas que todavía usen este nombre.
export const sanitizeBasicHtml = sanitizeHtml;
