const API_BASE = 'http://localhost:8000/api';

export async function apiRequest(path, {method = "GET", body, headers } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    // Intentamos leer Json (si el backend devuelve vacío, evitamos petar)
    let data = {};
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        const err = new Error("API error");
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

export function apiGet(path) {
  return apiRequest("GET", path);
}

export function apiPost(path, body) {
  return apiRequest("POST", path, body);
}

export function apiPatch(path, body) {
  return apiRequest("PATCH", path, body);
}