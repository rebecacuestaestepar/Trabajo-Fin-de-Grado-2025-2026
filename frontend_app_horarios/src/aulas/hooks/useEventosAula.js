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
      nombre_comleto: e.nombre_completo,
    },
  };
}

export function useEventosAula({ aulasNombres = [], tipo }) {
  const [range, setRange] = useState(null); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const aulasKey = [...aulasNombres].sort((a, b) => a.localeCompare(b)).join(",");

  const cargar = useCallback(async () => {

    if (!aulasKey || !range?.start || !range?.end) return;

    setLoading(true);
    setError("");

    try {
      const aulasArray = aulasKey.split(",");
      const promesas = aulasArray.map((aula) =>
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
  }, [aulasKey, range?.start, range?.end, tipo]);
  

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ events, loading, error, setRange, recargar: cargar }),
    [events, loading, error, cargar]
  );
}
