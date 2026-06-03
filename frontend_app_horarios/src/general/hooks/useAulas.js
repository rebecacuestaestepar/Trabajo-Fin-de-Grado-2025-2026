import { useEffect, useState } from "react";
import { obtenerAulasCampus } from "../../api/aulas";

// Ahora el hook recibe el campus seleccionado
export function useAulas(campus) {
  const [aulas, setAulas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        setCargando(true);
        const datos = await obtenerAulasCampus(campus);
        if (vivo) setAulas(datos);
      } catch (e) {
        if (vivo) setError(e?.message || "Error cargando aulas");
      } finally {
        if (vivo) setCargando(false);
      }
    })();

    return () => {
      vivo = false;
    };
  }, [campus]);

  return { aulas, cargando, error };
}