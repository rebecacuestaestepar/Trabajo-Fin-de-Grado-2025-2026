import { apiGet } from "./client";

export async function obtenerAulas() {
  const respuesta = await fetch("http://localhost:8000/api/aulas/");
  if (!respuesta.ok) throw new Error("No se pudieron cargar las aulas");
  return respuesta.json();
}

export async function getEventosAula({ aulaId, start, end, tipo = "AMBAS" }) {
  const params = new URLSearchParams({
    aula_id: String(aulaId),
    start: start.toISOString(),
    end: end.toISOString(),
    tipo,
  });

  return apiGet(`/aulas/ocupacion?${params.toString()}`);
}
