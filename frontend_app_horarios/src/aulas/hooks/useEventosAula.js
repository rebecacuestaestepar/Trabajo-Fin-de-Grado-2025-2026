// src//aulas/hooks/useEventosAula.js
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { getEventosAula } from "../../api/aulas";

function normalizarEvento(e) {
  return {
    id: String(e.id),
    title: e.title ?? e.titulo ?? "(sin título)",
    start: e.start,
    end: e.end,
    // guardamos todo en extendedProps para usarlo al click/colores
    extendedProps: {
      ...e,
      tipo: e.tipo, // "PUNTUAL" | "PERIODICA"
      aula: e.aula, // nombre del aula
    },
  };
}

export function useEventosAula({ aulasNombres = [], tipo }) {
  const [range, setRange] = useState(null); // {start, end}
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*const cargar = useCallback(async () => {
    //const aula = String(aulaNombre ?? "").trim();
    // Si no hay aulas seleccionadas o no hay rango en el calendario, salimos
    if (!aulaNombre  || !range?.start || !range?.end) return;

    setLoading(true);
    setError("");
    try {
      const data = await getEventosAula({
        aulaNombre,
        start: range.start,
        end: range.end,
        tipo,
      });
      setEvents(Array.isArray(data) ? data.map(normalizarEvento) : []);
    } catch (e) {
      setEvents([]);
      setError(e?.message || "Error cargando eventos");
    } finally {
      setLoading(false);
    }
  }, [aulaNombre, range, tipo]);*/

  const aulasKey = aulasNombres.sort().join(","); // ordenamos para evitar recargas innecesarias por el orden de las aulas

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

      // Esperamos a que todas las promesas se resuelvan
      const resultados = await Promise.all(promesas);

      // Juntamos todos los arrays de eventos en uno solo y lo normalizamos
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
