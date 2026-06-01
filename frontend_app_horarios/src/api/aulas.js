import { apiGet, apiRequest } from "./client";

export async function obtenerAulas() {
  const respuesta = await fetch("http://localhost:8000/api/aulas/lista/");
  if (!respuesta.ok) throw new Error("No se pudieron cargar las aulas");
  return respuesta.json();
}

export async function getEventosAula({ aulaNombre, start, end, tipo = "AMBAS" }) {
  const params = new URLSearchParams({
    aula: String(aulaNombre),
    start: start.toISOString(),
    end: end.toISOString(),
    tipo,
  });

  console.log("GET /aulas/ocupacion", params.toString());

  return apiGet(`/aulas/ocupacion?${params.toString()}`);
}

export function crearAula(datos) {
  return apiRequest("/aulas/", {
    method: "POST",
    body: datos
  });
}

export function actualizarAula(aulaId, datos) {
  return apiRequest(`/aulas/${aulaId}/`, {
    method: "PUT",
    body: datos
  });
}

export function eliminarAula(aulaId) {
  return apiRequest(`/aulas/${aulaId}/`, {
    method: "DELETE"
  });
}

export function obtenerDetalleAula(aulaId) {
  return apiRequest(`/aulas/${aulaId}/`, {
    method: "GET",
  });
}

export function listaAulas() {
  return apiRequest("/aulas/", {
    method: "GET",
  });
}

export function listaMiniAulas() {
  return apiRequest("/aulas/lista-mini/", {
    method: "GET",
  });
}
