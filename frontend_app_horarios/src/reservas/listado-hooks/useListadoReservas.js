import { useEffect, useMemo, useState } from "react";
import { normalizar, fechaEnRango } from "../listado-componentes/ui/fecha";

export function useListadoReservas({
  cargador, 
  despuesDeAccion,
}) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState(null);

  const [soloPendientes, setSoloPendientes] = useState(false); 

  // filtros UI
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  // const [usarMotivo, setUsarMotivo] = useState(true);
  // const [usarResponsable, setUsarResponsable] = useState(true);
  // const [usarRango, setUsarRango] = useState(true);

  const hoy = new Date().toISOString().split("T")[0];

  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [filtroDesde, setFiltroDesde] = useState(hoy);
  const [filtroHasta, setFiltroHasta] = useState("");

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    motivo: "",
    responsable: "",
    desde: hoy,
    hasta: "",
  });

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
    const motivoBuscado = normalizar(filtrosAplicados.motivo);
    const responsableBuscado = normalizar(filtrosAplicados.responsable);

    return reservas.filter((item) => {
      const motivo = normalizar(item.motivo ?? "");
      const correo = normalizar(item.correo_responsable /*?? item.correo*/ ?? "");
      const fechaISO = item.fecha;

      const estadoRow = item.estado;
      const estadoStr = String(estadoRow ?? "").trim().toUpperCase();
      const esPendiente = estadoStr === /*"PENDIENTE" ||*/ estadoStr === "P";

      if (soloPendientes && !esPendiente) return false;

      if ( motivoBuscado && !motivo.includes(motivoBuscado)) return false;
      if ( responsableBuscado && !correo.includes(responsableBuscado)) return false;

      if ((filtrosAplicados.desde || filtrosAplicados.hasta)) {
        if (!fechaEnRango(fechaISO, filtrosAplicados.desde, filtrosAplicados.hasta)) return false;
      }

      return true;
    });
  }, [
    reservas,
    soloPendientes,
    filtrosAplicados
  ]);

  function aplicarFiltros() {
    setFiltrosAplicados({
      motivo: filtroMotivo,
      responsable: filtroResponsable,
      desde: filtroDesde,
      hasta: filtroHasta,
    });
  }

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
    setFiltroMotivo("");
    setFiltroResponsable("");
    setFiltroDesde("");
    setFiltroHasta("");
    setSoloPendientes(false);

    setFiltrosAplicados({
      motivo: "",
      responsable: "",
      desde: "",
      hasta: "",
    });
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
    soloPendientes,
    setSoloPendientes,
    filtroMotivo,
    setFiltroMotivo,
    filtroResponsable,
    setFiltroResponsable,
    filtroDesde,
    setFiltroDesde,
    filtroHasta,
    setFiltroHasta,
    limpiarFiltros,
    aplicarFiltros,

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
