export function formatPrice(precio) {
  if (!precio || precio.tipo === "Consultar" || precio.valor == null) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: precio.moneda || "ARS",
    maximumFractionDigits: 2,
  }).format(precio.valor);
}
