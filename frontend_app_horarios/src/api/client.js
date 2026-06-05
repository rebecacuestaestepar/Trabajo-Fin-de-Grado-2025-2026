const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";

if (!API_ORIGIN) {
  throw new Error("ERROR: La variable de entorno VITE_API_ORIGIN no está definida.");
}

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

async function parseResponse(res, responseType) {
  if (responseType === 'blob') {
    return await res.blob();
  }
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

async function refrescarToken() {
  const refreshToken = sessionStorage.getItem("refresh");

  if (!refreshToken || refreshToken === "undefined") {
    throw new Error("No hay refresh token disponible en la sesión.");
  }

  const urlRefresh = buildUrl("/auth/token/refresh/");

  const res = await fetch(urlRefresh, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (!res.ok) {
    throw new Error("El refresh token también ha expirado.");
  }

  const data = await res.json();

  sessionStorage.setItem("token", data.access);
  return data.access;
}

// Función principal para hacer peticiones a la API
export async function apiFetch(
  path,
  { method = "GET", body, headers = {}, credentials, responseType, ...rest } = {}
) {
  // Construye la URL completa
  const url = buildUrl(path);

  // Comprueba si el body es FormData, es decir, imágenes u otros ficheros
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const token = sessionStorage.getItem("token");

  const opts = {
    method,
    credentials: credentials ?? "omit",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  let res = await fetch(url, opts);
  
  if (res.status === 401) {
    console.warn("Ha caducado la sesión. Intentando renovar sesión...");
    try {
      const nuevoToken = await refrescarToken();
      
      opts.headers["Authorization"] = `Bearer ${nuevoToken}`;
      
      res = await fetch(url, opts);
      
    } catch (e) {
      console.error("Imposible refrescar sesión. El refresh token expiró o no existe.", e);
      sessionStorage.clear();
      window.location.href = "/?motivo=expirado";
      
      const errorSesion = new Error("Tu sesión ha expirado de forma definitiva. Por favor, inicia sesión de nuevo.");
      errorSesion.status = 401;
      throw errorSesion;
    }
  }

  const data = await parseResponse(res, responseType);
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
