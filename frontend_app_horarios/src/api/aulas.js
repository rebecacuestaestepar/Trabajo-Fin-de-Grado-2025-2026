import { apiRequest } from "./client";

export function obtenerAulasCampus(campus) {
  const url = campus ? `/aulas/menu/?campus=${campus}` : "/aulas/menu/";
  return apiRequest(url, {
    method: "GET",
  });
}

export async function getEventosAula({ aulaNombre, start, end, tipo = "AMBAS" }) {
  const params = new URLSearchParams({
    aula: String(aulaNombre),
    start: start.toISOString(),
    end: end.toISOString(),
    tipo,
  });
  return apiRequest(`/aulas/ocupacion?${params.toString()}`);
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
