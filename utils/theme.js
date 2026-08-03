const CSS_VARIABLES = Object.freeze({
  primary: "--color-primary",
  primaryDark: "--color-primary-dark",
  primaryText: "--color-primary-text",
  secondary: "--color-secondary",
  background: "--color-background",
  surface: "--color-surface",
  sidebar: "--color-sidebar",
  text: "--color-text",
  textSoft: "--color-text-soft",
  border: "--color-border",
});

const FALLBACK_BASE = "#6C63FF";

function normalizeHex(value, fallback = FALLBACK_BASE) {
  const color = String(value || "").trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(color) ? color : fallback;
}

function hexToRgb(hex) {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const channel = (value) => Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");

  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

function mix(hexA, hexB, amountB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, Number(amountB) || 0));

  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "#18202A" : "#FFFFFF";
}

function buildPalette(appearance) {
  const apiColors = appearance?.tema?.colores ?? appearance?.colores ?? {};
  const base = normalizeHex(
    appearance?.colorBase ?? appearance?.tema?.colorBase ?? apiColors.primary,
  );

  const text = normalizeHex(apiColors.text, mix(base, "#000000", 0.76));

  return {
    primary: normalizeHex(apiColors.primary, base),
    primaryDark: normalizeHex(apiColors.primaryDark, mix(base, "#000000", 0.18)),
    primaryText: normalizeHex(apiColors.primaryText, contrastText(base)),
    secondary: normalizeHex(apiColors.secondary, mix(base, "#FFFFFF", 0.78)),
    background: normalizeHex(apiColors.background, mix(base, "#FFFFFF", 0.90)),
    surface: normalizeHex(apiColors.surface, mix(base, "#FFFFFF", 0.975)),
    sidebar: normalizeHex(apiColors.sidebar, mix(base, "#000000", 0.68)),
    text,
    textSoft: normalizeHex(apiColors.textSoft, mix(text, "#FFFFFF", 0.42)),
    border: normalizeHex(apiColors.border, mix(base, "#FFFFFF", 0.78)),
    base,
  };
}

export function applyTheme(appearance) {
  if (!appearance) return;

  const palette = buildPalette(appearance);
  const root = document.documentElement;

  Object.entries(CSS_VARIABLES).forEach(([key, cssVariable]) => {
    root.style.setProperty(cssVariable, palette[key]);
  });

  const baseRgb = hexToRgb(palette.base);
  const textRgb = hexToRgb(palette.text);

  root.style.setProperty("--color-theme-base", palette.base);
  root.style.setProperty("--color-primary-rgb", `${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}`);
  root.style.setProperty("--color-text-rgb", `${textRgb.r}, ${textRgb.g}, ${textRgb.b}`);
  root.style.setProperty(
    "--shadow-sm",
    `0 8px 24px rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.08)`,
  );
  root.style.setProperty(
    "--shadow-md",
    `0 18px 44px rgba(${textRgb.r}, ${textRgb.g}, ${textRgb.b}, 0.12)`,
  );

  document.body.dataset.theme = appearance?.tema?.id || "personalizado";

  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    document.head.appendChild(themeMeta);
  }
  themeMeta.content = palette.primary;
}
