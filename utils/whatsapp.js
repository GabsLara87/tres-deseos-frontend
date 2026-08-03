import { safeUrl } from "./dom.js";

export function buildWhatsappConsultUrl(configuredUrl) {
  const safeConfiguredUrl = safeUrl(configuredUrl);
  if (!safeConfiguredUrl) return "";

  try {
    const whatsappUrl = new URL(safeConfiguredUrl);
    const productUrl = new URL(window.location.href);
    productUrl.hash = "";

    whatsappUrl.searchParams.set(
      "text",
      `Hola, quiero consultarte sobre el siguiente producto: ${productUrl.href}`,
    );

    return safeUrl(whatsappUrl.href);
  } catch {
    return "";
  }
}
