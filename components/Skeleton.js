export function Skeleton({ width = "100%", height = "1rem" } = {}) {
  return `
    <span
      class="skeleton"
      aria-hidden="true"
      style="width:${width};height:${height}"
    ></span>
  `;
}
