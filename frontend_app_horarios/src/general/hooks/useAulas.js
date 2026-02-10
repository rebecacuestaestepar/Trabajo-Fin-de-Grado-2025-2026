import { useEffect, useState } from "react";
import { obtenerAulas } from "../../api/aulas";

export function useAulas() {
  const [aulas, setAulas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        setCargando(true);
        const datos = await obtenerAulas();
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
  }, []);

  return { aulas, cargando, error };
}
