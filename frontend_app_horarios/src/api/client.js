const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";

// Construye la URL completa para la petición
function buildUrl(path) {
  // Si la path es una URL completa, la devolvemos tal cual
  if (path.startsWith("http")) return path;
  // Si no, construimos la URL completa, primero nos aseguramos de que empieza por /
  let p = path.startsWith("/") ? path : `/${path}`;
  // Luego nos aseguramos de que empieza por /api/
  if (!p.startsWith("/api/")) p = `/api${p}`;
  return `${API_ORIGIN}${p}`;   // Construimos la URL completa
}

async function parseResponse(res) {
  // Mira la cabecera Content-Type para decidir cómo parsear la respuesta
  const ct = res.headers.get("content-type") || "";
  // Si es JSON, parsea como JSON
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    // Si no es JSON, parsea como texto
    return await res.text();
  } catch {
    return null;
  }
}

// Función principal para hacer peticiones a la API
export async function apiFetch(
  path,
  { method = "GET", body, headers = {}, credentials, ...rest } = {}
) {
  // Construye la URL completa
  const url = buildUrl(path);

  // Comprueba si el body es FormData, es decir, imágenes u otros ficheros
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const opts = {
    method,
    credentials: credentials ?? "omit",
    headers: {
      Accept: "application/json",
      ...headers,
    },
    ...rest,
  };

  // Convierte el body a JSON si no es FormData y pone la cabecera adecuada
  if (body !== undefined && body !== null) {
    if (isFormData) {
      opts.body = body;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, opts);
  const data = await parseResponse(res);
  // Si la respuesta no es OK, lanza un error con el mensaje adecuado
  if (!res.ok) {
    const err = new Error(
      (data && typeof data === "object" && (data.detail || data.general)) ||
        (typeof data === "string" && data.slice(0, 300)) ||
        `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function apiRequest(path, opts = {}) {
  return apiFetch(path, opts);
}
export function apiGet(path, opts = {}) {
  return apiFetch(path, { ...opts, method: "GET" });
}
export function apiPost(path, body, opts = {}) {
  return apiFetch(path, { ...opts, method: "POST", body });
}
export function apiPatch(path, body, opts = {}) {
  return apiFetch(path, { ...opts, method: "PATCH", body });
}

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};
