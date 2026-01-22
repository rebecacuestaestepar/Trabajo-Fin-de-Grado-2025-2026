// src/api/client.js
/*const API_BASE = "http://localhost:8000/api";

export async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${method} ${path} failed`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function apiGet(path) {
  return apiRequest(path, { method: "GET" });
}

export function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body });
}

export function apiPatch(path, body) {
  return apiRequest(path, { method: "PATCH", body });
}
*/
// src/api/client.js (ejemplo)
// src/api/client.js
// src/api/client.js
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";

// Construye la URL completa para la petición
function buildUrl(path) {
  // Acepta:
  //  - "/api/..."   (ya viene con /api)
  //  - "/reservas/..." (le añadimos /api)
  //  - "http://..." (URL completa)
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
    // 👇 IMPORTANTE: por defecto NO mandamos cookies (evita el error CORS)
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

/** ✅ Compatibilidad con imports antiguos **/
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

/** ✅ API nueva tipo api.get/api.post **/
export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};
