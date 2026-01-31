import { useEffect, useMemo, useState } from "react";
import { normalizar, fechaEnRango } from "../listado-componentes/ui/fecha";

export function useListadoReservas({
  cargador, // async () => data
  despuesDeAccion, // async refresh optional
}) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState(null);

  // filtros UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [usarMotivo, setUsarMotivo] = useState(false);
  const [usarResponsable, setUsarResponsable] = useState(false);
  const [usarRango, setUsarRango] = useState(false);

  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  // selección
  const [idsSeleccionados, setIdsSeleccionados] = useState(() => new Set());

  async function cargar() {
    setCargando(true);
    setError(null);

    try {
      const data = await cargador();
      setReservas(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reservasFiltradas = useMemo(() => {
    const motivoBuscado = normalizar(filtroMotivo);
    const responsableBuscado = normalizar(filtroResponsable);

    return reservas.filter((item) => {
      const motivo = normalizar(item.motivo ?? "");
      const correo = normalizar(item.correo_responsable ?? item.correo ?? "");
      const fechaISO = item.fecha;

      if (usarMotivo && motivoBuscado && !motivo.includes(motivoBuscado)) return false;
      if (usarResponsable && responsableBuscado && !correo.includes(responsableBuscado)) return false;

      if (usarRango && (filtroDesde || filtroHasta)) {
        if (!fechaEnRango(fechaISO, filtroDesde, filtroHasta)) return false;
      }

      return true;
    });
  }, [
    reservas,
    usarMotivo,
    usarResponsable,
    usarRango,
    filtroMotivo,
    filtroResponsable,
    filtroDesde,
    filtroHasta,
  ]);

  const idsFiltrados = useMemo(
    () => reservasFiltradas.map((x) => x.id ?? x.idreserva),
    [reservasFiltradas]
  );

  const cantidadSeleccionadas = idsSeleccionados.size;

  const todoVisibleSeleccionado = useMemo(() => {
    if (idsFiltrados.length === 0) return false;
    return idsFiltrados.every((id) => idsSeleccionados.has(id));
  }, [idsFiltrados, idsSeleccionados]);

  const algunoVisibleSeleccionado = useMemo(() => {
    return idsFiltrados.some((id) => idsSeleccionados.has(id));
  }, [idsFiltrados, idsSeleccionados]);

  function alternarSeleccionUno(id) {
    setIdsSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function alternarSeleccionTodoVisible() {
    setIdsSeleccionados((prev) => {
      const next = new Set(prev);
      const debeSeleccionar = !idsFiltrados.every((id) => next.has(id));

      if (debeSeleccionar) idsFiltrados.forEach((id) => next.add(id));
      else idsFiltrados.forEach((id) => next.delete(id));

      return next;
    });
  }

  function limpiarSeleccion() {
    setIdsSeleccionados(new Set());
  }

  function limpiarFiltros() {
    setUsarMotivo(false);
    setUsarResponsable(false);
    setUsarRango(false);
    setFiltroMotivo("");
    setFiltroResponsable("");
    setFiltroDesde("");
    setFiltroHasta("");
  }

  async function ejecutarAccion(funcionAsync) {
    setAccionando(true);
    setError(null);

    try {
      await funcionAsync();
      if (despuesDeAccion) await despuesDeAccion();
      await cargar();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setAccionando(false);
    }
  }

  return {
    // datos
    reservas,
    reservasFiltradas,
    cargando,
    accionando,
    error,
    cargar,

    // filtros
    mostrarFiltros,
    setMostrarFiltros,
    usarMotivo,
    setUsarMotivo,
    usarResponsable,
    setUsarResponsable,
    usarRango,
    setUsarRango,
    filtroMotivo,
    setFiltroMotivo,
    filtroResponsable,
    setFiltroResponsable,
    filtroDesde,
    setFiltroDesde,
    filtroHasta,
    setFiltroHasta,
    limpiarFiltros,

    // selección
    idsSeleccionados,
    cantidadSeleccionadas,
    todoVisibleSeleccionado,
    algunoVisibleSeleccionado,
    alternarSeleccionUno,
    alternarSeleccionTodoVisible,
    limpiarSeleccion,

    // helper acción
    ejecutarAccion,
  };
}
