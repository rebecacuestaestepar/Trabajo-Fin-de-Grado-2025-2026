function rellenar2(n) {
  return String(n).padStart(2, "0");
}

export function formatearFechaHora(fechaISO, horaInicio, horaFin) {
  if (!fechaISO) return "—";

  const [anio, mes, dia] = fechaISO.split("-");
  const fecha = `${rellenar2(dia)}/${rellenar2(mes)}/${anio}`;

  const hi = horaInicio?.slice(0, 5) ?? "??:??";
  const hf = horaFin?.slice(0, 5) ?? "??:??";

  return `${fecha} ${hi}-${hf}`;
}

export function normalizar(texto) {
  return String(texto ?? "").trim().toLowerCase();
}


export function fechaEnRango(fechaISO, desdeISO, hastaISO) {
  if (!fechaISO) return false;

  const f = fechaISO; // YYYY-MM-DD

  if (desdeISO && f < desdeISO) return false;
  if (hastaISO && f > hastaISO) return false;

  return true;
}

