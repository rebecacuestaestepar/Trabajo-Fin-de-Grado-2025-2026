import { useCallback, useEffect, useMemo, useState } from "react";
import { getEventosAula } from "../../api/aulas";

function normalizarEvento(e) {
  return {
    id: String(e.id),
    title: e.title ?? e.titulo ?? "(sin título)",
    start: e.start,
    end: e.end,
    extendedProps: {
      ...e,
      tipo: e.tipo, 
      aula: e.aula, 
    },
  };
}

export function useEventosAula({ aulasNombres = [], tipo }) {
  const [range, setRange] = useState(null); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const aulasKey = aulasNombres.sort().join(","); 

  const rangeKey = range?.start && range?.end 
    ? `${range.start.toISOString()}_${range.end.toISOString()}` 
    : "";

  const cargar = useCallback(async () => {

    if (!aulasKey || aulasNombres.length === 0 || !range?.start || !range?.end) return;

    setLoading(true);
    setError("");

    try {
      // Creamos un array de promesas para cada aula
      const promesas = aulasNombres.map((aula) =>
        getEventosAula({
          aulaNombre: aula,
          start: range.start,
          end: range.end,
          tipo,
        })
      );

      const resultados = await Promise.all(promesas);

      const todosLosEventos = resultados.flat().map(normalizarEvento);

      setEvents(todosLosEventos);


    } catch (e) {
      setEvents([]);
      setError(e?.message || "Error cargando eventos de las aulas");
    } finally {
      setLoading(false);
    }
  }, [aulasKey, rangeKey, tipo]);
  

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ events, loading, error, setRange, recargar: cargar }),
    [events, loading, error, cargar]
  );
}
