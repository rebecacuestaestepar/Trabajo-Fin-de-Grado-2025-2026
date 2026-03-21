function aFecha(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function aISOFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}


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