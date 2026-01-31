function aFecha(iso) {
  // iso esperado: "YYYY-MM-DD"
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function aISOFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/**
 * Calcula las fechas periódicas entre dos fechas (incluidas) para un día de la semana concreto.
 * @param {string} fechaInicio - "YYYY-MM-DD"
 * @param {string} fechaFin - "YYYY-MM-DD"
 * @param {number|string} diaSemanaPeriodica - 0..6 (domingo..sábado, como JS Date.getDay())
 * @returns {string[]} lista de fechas ISO "YYYY-MM-DD"
 */
export function calcularFechasPeriodicas(fechaInicio, fechaFin, diaSemanaPeriodica) {
  if (!fechaInicio || !fechaFin || diaSemanaPeriodica === null || diaSemanaPeriodica === undefined) {
    return [];
  }

  const inicio = aFecha(fechaInicio);
  const fin = aFecha(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return [];
  if (inicio > fin) return [];

  const diaObjetivo = Number(diaSemanaPeriodica) % 7;

  const fecha = new Date(inicio);
  while (fecha.getDay() !== diaObjetivo) {
    fecha.setDate(fecha.getDate() + 1);
  }

  const resultado = [];
  while (fecha <= fin) {
    resultado.push(aISOFecha(fecha));
    fecha.setDate(fecha.getDate() + 7);
  }

  return resultado;
}