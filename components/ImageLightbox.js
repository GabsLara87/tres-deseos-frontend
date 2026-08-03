import { escapeHtml, safeUrl } from "../utils/dom.js";

let initialized = false;
let images = [];
let currentIndex = 0;
let lastFocused = null;

function ensureModal() {
  let modal = document.querySelector("[data-image-lightbox]");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "image-lightbox";
  modal.dataset.imageLightbox = "";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="image-lightbox-backdrop" data-lightbox-close></div>
    <div class="image-lightbox-dialog" role="document">
      <button class="image-lightbox-close" type="button" data-lightbox-close aria-label="Cerrar imagen">×</button>
      <button class="image-lightbox-nav image-lightbox-prev" type="button" data-lightbox-prev aria-label="Imagen anterior">‹</button>
      <figure class="image-lightbox-figure">
        <img data-lightbox-image alt="">
        <figcaption data-lightbox-caption></figcaption>
      </figure>
      <button class="image-lightbox-nav image-lightbox-next" type="button" data-lightbox-next aria-label="Imagen siguiente">›</button>
      <span class="image-lightbox-counter" data-lightbox-counter></span>
    </div>`;

  document.body.appendChild(modal);
  return modal;
}

function collectImages(trigger) {
  const group = trigger.closest("[data-lightbox-group]");
  const candidates = group
    ? [...group.querySelectorAll("[data-lightbox-src]")]
    : [trigger];

  const seen = new Set();

  return candidates
    .map((element) => ({
      src: safeUrl(element.dataset.lightboxSrc || element.getAttribute("src")),
      alt: element.dataset.lightboxAlt || element.getAttribute("alt") || "Imagen ampliada",
      element,
    }))
    .filter((item) => item.src && !seen.has(item.src) && seen.add(item.src));
}

function render() {
  const modal = ensureModal();
  const item = images[currentIndex];
  if (!item) return;

  const image = modal.querySelector("[data-lightbox-image]");
  const caption = modal.querySelector("[data-lightbox-caption]");
  const counter = modal.querySelector("[data-lightbox-counter]");
  const prev = modal.querySelector("[data-lightbox-prev]");
  const next = modal.querySelector("[data-lightbox-next]");

  image.src = item.src;
  image.alt = item.alt;
  caption.innerHTML = escapeHtml(item.alt);
  counter.textContent = images.length > 1 ? `${currentIndex + 1} / ${images.length}` : "";
  prev.hidden = images.length < 2;
  next.hidden = images.length < 2;
}

function open(trigger) {
  images = collectImages(trigger);
  if (!images.length) return;

  currentIndex = Math.max(0, images.findIndex((item) => item.element === trigger));
  lastFocused = document.activeElement;

  const modal = ensureModal();
  render();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("lightbox-open");
  modal.querySelector("[data-lightbox-close]")?.focus();
}

function close() {
  const modal = document.querySelector("[data-image-lightbox]");
  if (!modal?.classList.contains("is-open")) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("lightbox-open");
  modal.querySelector("[data-lightbox-image]")?.removeAttribute("src");
  lastFocused?.focus?.();
}

function move(step) {
  if (images.length < 2) return;
  currentIndex = (currentIndex + step + images.length) % images.length;
  render();
}

export function initImageLightbox() {
  if (initialized) return;
  initialized = true;
  ensureModal();

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox-src]");
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      open(trigger);
      return;
    }

    if (event.target.closest("[data-lightbox-close]")) close();
    if (event.target.closest("[data-lightbox-prev]")) move(-1);
    if (event.target.closest("[data-lightbox-next]")) move(1);
  });

  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector("[data-image-lightbox].is-open");
    if (!modal) return;

    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
}
