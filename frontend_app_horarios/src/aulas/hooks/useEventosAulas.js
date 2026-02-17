// src/hooks/useEventosAula.js
import { useCallback, useEffect, useMemo, useState } from "react";
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
    },
  };
}

export function useEventosAula({ aulaId, tipo }) {
  const [range, setRange] = useState(null); // {start, end}
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    if (!aulaId || !range?.start || !range?.end) return;

    setLoading(true);
    setError("");
    try {
      const data = await getEventosAula({
        aulaId,
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
  }, [aulaId, range, tipo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ events, loading, error, setRange, recargar: cargar }),
    [events, loading, error, cargar]
  );
}
