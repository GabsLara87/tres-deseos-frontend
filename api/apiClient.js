const CATALOG_URL = "https://gabslara87.github.io/tres-deseos-data/catalogo.json";
const API_PREFIX = "/api/v1/";

let cachedCatalog = null;
let cachedPublishedAt = "";
let pendingCatalog = null;

export async function apiGet(url, options = {}) {
  const request = new URL(url, window.location.origin);
  const route = extractRoute(request.pathname);
  const forceRefresh = route === "versiones" || options.force === true;
  const catalog = await loadCatalog({
    force: forceRefresh,
    timeout: options.timeout ?? 20000,
  });

  const data = resolveRoute(catalog, route, request.searchParams);

  if (data === null || data === undefined) {
    throw new Error("El recurso solicitado no está disponible.");
  }

  return {
    ok: true,
    datos: data,
    mensaje: "Datos públicos obtenidos correctamente.",
    codigo: "CATALOGO_ESTATICO",
  };
}

async function loadCatalog({ force = false, timeout = 20000 } = {}) {
  if (!force && cachedCatalog) {
    return cachedCatalog;
  }

  if (!pendingCatalog) {
    pendingCatalog = fetchWithTimeout(
      `${CATALOG_URL}?t=${Date.now()}`,
      timeout,
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar el catálogo público (${response.status}).`);
        }

        const next = await response.json();
        if (!next || next.schemaVersion !== 1) {
          throw new Error("El archivo catalogo.json tiene un formato inválido.");
        }

        const publishedAt = String(next.publicadoEn || "");
        if (!cachedCatalog || publishedAt !== cachedPublishedAt) {
          cachedCatalog = next;
          cachedPublishedAt = publishedAt;
        }

        return cachedCatalog;
      })
      .finally(() => {
        pendingCatalog = null;
      });
  }

  return pendingCatalog;
}

function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: controller.signal,
    headers: { Accept: "application/json" },
  }).finally(() => window.clearTimeout(timer));
}

function extractRoute(pathname) {
  const index = pathname.indexOf(API_PREFIX);
  if (index === -1) return "";
  return pathname.slice(index + API_PREFIX.length).replace(/^\/+|\/+$/g, "");
}

function resolveRoute(catalog, route, params) {
  if (route === "versiones") {
    return {
      versiones: catalog.versiones || {},
      consultadoEn: new Date().toISOString(),
      publicadoEn: catalog.publicadoEn,
    };
  }

  if (route === "configuracion") return catalog.configuracion;
  if (route === "inicio") return catalog.inicio;
  if (route === "categorias") return catalog.categorias || [];
  if (route === "colecciones") {
    const items = Array.isArray(catalog.colecciones) ? catalog.colecciones : [];
    return { items, total: items.length, url: "/colecciones" };
  }
  if (route === "kits") return filterKits(catalog.kits, params);
  if (route === "productos") return filterProducts(catalog.productos || [], params);

  const [resource, encodedSlug, extra] = route.split("/");
  if (!resource || !encodedSlug || extra) return null;

  const slug = decodeURIComponent(encodedSlug).trim().toLowerCase();

  if (resource === "categorias") {
    const category = catalog.detalles?.categorias?.[slug];
    if (!category) return null;
    const filters = new URLSearchParams(params);
    filters.set("categoria", slug);
    return {
      categoria: category,
      productos: filterProducts(catalog.productos || [], filters),
    };
  }

  if (resource === "colecciones") {
    const collection = catalog.detalles?.colecciones?.[slug];
    if (!collection) return null;
    const filters = new URLSearchParams(params);
    filters.set("coleccion", slug);
    return {
      coleccion: collection,
      productos: filterProducts(catalog.productos || [], filters),
    };
  }

  if (resource === "kits") {
    const item = catalog.detalles?.kits?.[slug];
    return item ? { item } : null;
  }

  if (resource === "productos") {
    const item = catalog.detalles?.productos?.[slug];
    return item ? { item } : null;
  }

  return null;
}

function filterKits(kitsBlock, params) {
  const source = Array.isArray(kitsBlock?.items) ? kitsBlock.items : [];
  const search = normalizeText(params.get("buscar"));
  const limit = clampInteger(params.get("limite"), 1, 24, 24);
  const items = source
    .filter((item) => {
      if (!search) return true;
      return normalizeText([item.nombre, item.resumen, item.slug].join(" ")).includes(search);
    })
    .slice(0, limit);

  return { items, total: items.length, url: "/kits" };
}

function filterProducts(products, params) {
  const page = clampInteger(params.get("pagina"), 1, Number.MAX_SAFE_INTEGER, 1);
  const perPage = clampInteger(params.get("porPagina"), 1, 48, 12);
  const search = normalizeText(params.get("buscar"));
  const category = normalizeText(params.get("categoria"));
  const collection = normalizeText(params.get("coleccion"));
  const featured = parseNullableBoolean(params.get("destacados"));
  const order = normalizeOrder(params.get("orden"));

  const filtered = products.filter((product) => {
    if (category && normalizeText(product.categoria?.slug) !== category) return false;

    if (collection) {
      const collections = product.colecciones || product.coleccionesSlugs || [];
      const belongs = collections.some((item) =>
        normalizeText(typeof item === "string" ? item : item?.slug) === collection,
      );
      if (!belongs) return false;
    }

    if (featured !== null && Boolean(product.destacado) !== featured) return false;

    if (search) {
      const searchable = normalizeText([
        product.nombre,
        product.resumen,
        product.descripcionCorta,
        product.descripcion,
        product.slug,
        product.categoria?.nombre,
      ].join(" "));
      if (!searchable.includes(search)) return false;
    }

    return true;
  });

  filtered.sort(productComparator(order));

  const total = filtered.length;
  const totalPages = total ? Math.ceil(total / perPage) : 0;
  const appliedPage = totalPages ? Math.min(page, totalPages) : 1;
  const from = (appliedPage - 1) * perPage;
  const items = filtered.slice(from, from + perPage);
  const publicFilters = {
    buscar: params.get("buscar") || null,
    categoria: params.get("categoria") || null,
    coleccion: params.get("coleccion") || null,
    destacados: featured,
    orden: order,
  };

  return {
    items,
    paginacion: {
      pagina: appliedPage,
      porPagina: perPage,
      total,
      totalPaginas: totalPages,
      tieneAnterior: appliedPage > 1,
      tieneSiguiente: totalPages > 0 && appliedPage < totalPages,
      anteriorUrl: appliedPage > 1
        ? buildProductsPath(appliedPage - 1, perPage, publicFilters)
        : null,
      siguienteUrl: totalPages > 0 && appliedPage < totalPages
        ? buildProductsPath(appliedPage + 1, perPage, publicFilters)
        : null,
    },
    filtros: publicFilters,
  };
}

function buildProductsPath(page, perPage, filters) {
  const params = new URLSearchParams({ pagina: page, porPagina: perPage });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== "" && value !== undefined) {
      params.set(key, value);
    }
  });
  return `/api/v1/productos?${params.toString()}`;
}

function productComparator(order) {
  return (a, b) => {
    const nameA = String(a.nombre || "");
    const nameB = String(b.nombre || "");
    const priceA = sortablePrice(a);
    const priceB = sortablePrice(b);

    if (order === "precio_asc" && priceA !== priceB) return priceA - priceB;
    if (order === "precio_desc" && priceA !== priceB) return priceB - priceA;
    if (order === "nombre_asc") return nameA.localeCompare(nameB, "es");
    if (order === "nombre_desc") return nameB.localeCompare(nameA, "es");
    if (order === "destacados" && Boolean(a.destacado) !== Boolean(b.destacado)) {
      return Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    }

    const orderA = Number(a.orden ?? Number.MAX_SAFE_INTEGER);
    const orderB = Number(b.orden ?? Number.MAX_SAFE_INTEGER);
    return orderA !== orderB ? orderA - orderB : nameA.localeCompare(nameB, "es");
  };
}

function sortablePrice(product) {
  const value = Number(product.precio ?? product.precioBase);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function normalizeOrder(value) {
  const order = String(value || "predeterminado").trim().toLowerCase();
  const allowed = [
    "predeterminado", "orden", "destacados", "precio_asc",
    "precio_desc", "nombre_asc", "nombre_desc",
  ];
  return allowed.includes(order) ? (order === "orden" ? "predeterminado" : order) : "predeterminado";
}

function parseNullableBoolean(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = normalizeText(value);
  if (["true", "1", "si"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return null;
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
