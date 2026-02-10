export async function obtenerAulas() {
  const respuesta = await fetch("http://localhost:8000/api/aulas/");
  if (!respuesta.ok) throw new Error("No se pudieron cargar las aulas");
  return respuesta.json();
}
