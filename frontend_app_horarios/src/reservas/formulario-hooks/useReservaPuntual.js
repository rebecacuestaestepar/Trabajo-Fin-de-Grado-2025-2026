import { useEffect, useMemo, useState } from "react";
import { buscarAulasDisponibles, solicitarReservaPuntual } from "../../api/reservas";
import { calcularFechasPeriodicas } from "../formulario-utiles/fechasPeriodicas";

export function useReservaPuntual() {
  const [formulario, setFormulario] = useState({
    // Estas claves se envían al backend: mejor NO traducirlas.
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    capacidad_solicitada: "",
    correo_responsable: "",
    num_ordenadores: "",
    altavoces: false,
    proyector: false,
    camara: false,
    enchufes: false,

    generar_periodica: false,
    fecha_inicio_periodo: "",
    fecha_fin_periodo: "",
    dia_semana_periodica: "",
  });

  // Patch del formulario (mezcla parcial)
  const aplicarCambios = (parcial) =>
    setFormulario((prev) => ({ ...prev, ...parcial }));

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);

  const [modoSeleccionAula, setModoSeleccionAula] = useState("simple"); // simple|comun|por_fecha
  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState("");

  const [fechasPeriodicas, setFechasPeriodicas] = useState([]);
  const [aulasPorFecha, setAulasPorFecha] = useState({});
  const [seleccionPorFecha, setSeleccionPorFecha] = useState({});

  const [cargandoAulas, setCargandoAulas] = useState(false);

  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [cantidadConfirmacion, setCantidadConfirmacion] = useState(0);

  // Copiar fecha a inicio de período cuando se activa periodicidad
  useEffect(() => {
    if (formulario.generar_periodica) {
      aplicarCambios({ fecha_inicio_periodo: formulario.fecha });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulario.fecha, formulario.generar_periodica]);

  // Reset de selección de aulas al activar/desactivar periodicidad
  useEffect(() => {
    setAulasDisponibles([]);
    setAulaSeleccionada("");
    setFechasPeriodicas([]);
    setAulasPorFecha({});
    setSeleccionPorFecha({});
    setModoSeleccionAula(formulario.generar_periodica ? "comun" : "simple");
  }, [formulario.generar_periodica]);

  const puedeBuscarAulas = useMemo(() => {
    if (
      !formulario.fecha ||
      !formulario.hora_inicio ||
      !formulario.hora_fin ||
      String(formulario.capacidad_solicitada).trim() === ""
    ) {
      return false;
    }

    if (!formulario.generar_periodica) return true;

    return (
      !!formulario.fecha_inicio_periodo &&
      !!formulario.fecha_fin_periodo &&
      !!formulario.dia_semana_periodica
    );
  }, [formulario]);

  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setCargandoAulas(true);

    const payload = {
      fecha: formulario.generar_periodica ? undefined : formulario.fecha,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
      capacidad_solicitada: Number(formulario.capacidad_solicitada),
      num_ordenadores:
        formulario.num_ordenadores === "" ? 0 : Number(formulario.num_ordenadores),
      altavoces: formulario.altavoces,
      proyector: formulario.proyector,
      camara: formulario.camara,
      enchufes: formulario.enchufes,
      generar_periodica: formulario.generar_periodica,
    };

    if (formulario.generar_periodica) {
      payload.fecha_inicio_periodo = formulario.fecha_inicio_periodo;
      payload.fecha_fin_periodo = formulario.fecha_fin_periodo;
      payload.dia_semana_periodica = Number(formulario.dia_semana_periodica);
    }

    try {
      const data = await buscarAulasDisponibles(payload);

      if (!formulario.generar_periodica) {
        setModoSeleccionAula("simple");
        setAulasDisponibles(data.aulas || []);
        setAulaSeleccionada(data.aulas?.length > 0 ? data.aulas[0].nombre : "");
        return;
      }

      const modo = data.modo;
      const fechas =
        data.fechas ||
        calcularFechasPeriodicas(
          formulario.fecha_inicio_periodo,
          formulario.fecha_fin_periodo,
          formulario.dia_semana_periodica
        );

      setFechasPeriodicas(fechas);

      if (modo === "comun") {
        const comunes = data.aulas_comunes || [];
        setModoSeleccionAula("comun");
        setAulasDisponibles(comunes);
        setAulaSeleccionada(comunes.length > 0 ? comunes[0].nombre : "");
        setAulasPorFecha({});
        setSeleccionPorFecha({});
      } else {
        const aulasPF = data.aulas_por_fecha || {};
        setModoSeleccionAula("por_fecha");
        setAulasDisponibles([]);
        setAulaSeleccionada("");
        setAulasPorFecha(aulasPF);

        const siguienteSeleccion = {};
        for (const f of fechas) {
          const lista = aulasPF[f] || [];
          siguienteSeleccion[f] = lista.length > 0 ? lista[0].nombre : "";
        }
        setSeleccionPorFecha(siguienteSeleccion);
      }
    } catch (e) {
      setErrores({ general: "Error al conectar con el servidor" });
      setAulasDisponibles([]);
      setAulaSeleccionada("");
      setFechasPeriodicas([]);
      setAulasPorFecha({});
      setSeleccionPorFecha({});
      setModoSeleccionAula(formulario.generar_periodica ? "comun" : "simple");
    } finally {
      setCargandoAulas(false);
    }
  };

  const puedeEnviar = useMemo(() => {
    if (
      !formulario.fecha ||
      !formulario.hora_inicio ||
      !formulario.hora_fin ||
      String(formulario.capacidad_solicitada).trim() === "" ||
      !formulario.correo_responsable
    ) {
      return false;
    }

    if (!formulario.generar_periodica) return !!aulaSeleccionada;

    const fechasCalc = calcularFechasPeriodicas(
      formulario.fecha_inicio_periodo,
      formulario.fecha_fin_periodo,
      formulario.dia_semana_periodica
    );

    if (fechasCalc.length === 0) return false;

    if (modoSeleccionAula === "comun") return !!aulaSeleccionada;
    if (modoSeleccionAula === "por_fecha")
      return fechasCalc.every((f) => !!seleccionPorFecha[f]);

    return false;
  }, [formulario, aulaSeleccionada, modoSeleccionAula, seleccionPorFecha]);

  const descripcionConfirmacion = useMemo(() => {
    if (!formulario.generar_periodica) return "";

    const fechasCalc = calcularFechasPeriodicas(
      formulario.fecha_inicio_periodo,
      formulario.fecha_fin_periodo,
      formulario.dia_semana_periodica
    );

    return `Vas a generar ${fechasCalc.length} reserva(s) periódica(s) entre ${
      formulario.fecha_inicio_periodo || "(sin inicio)"
    } y ${formulario.fecha_fin_periodo || "(sin fin)"}.`;
  }, [formulario]);

  const enviarSolicitud = async () => {
    setConfirmacionAbierta(false);

    const payload = {
      fecha: formulario.fecha,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
      motivo: formulario.motivo,
      capacidad_solicitada: Number(formulario.capacidad_solicitada),
      correo_responsable: formulario.correo_responsable,
      num_ordenadores:
        formulario.num_ordenadores === "" ? 0 : Number(formulario.num_ordenadores),
      altavoces: formulario.altavoces,
      proyector: formulario.proyector,
      camara: formulario.camara,
      enchufes: formulario.enchufes,
      generar_periodica: formulario.generar_periodica,
    };

    if (!formulario.generar_periodica) {
      payload.nombre_aula = aulaSeleccionada || "";
    } else {
      payload.fecha_inicio_periodo = formulario.fecha_inicio_periodo;
      payload.fecha_fin_periodo = formulario.fecha_fin_periodo;
      payload.dia_semana_periodica = Number(formulario.dia_semana_periodica);

      if (modoSeleccionAula === "comun") payload.nombre_aula = aulaSeleccionada || "";
      if (modoSeleccionAula === "por_fecha") payload.aulas_por_fecha = seleccionPorFecha;
    }

    try {
      const data = await solicitarReservaPuntual(payload);
      setMensaje(data.message || "Reserva(s) creada(s) correctamente");

      // Reset básico
      setFormulario((prev) => ({
        ...prev,
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        motivo: "",
        capacidad_solicitada: "",
        correo_responsable: "",
        num_ordenadores: "",
        altavoces: false,
        proyector: false,
        camara: false,
        enchufes: false,
        generar_periodica: false,
        fecha_inicio_periodo: "",
        fecha_fin_periodo: "",
        dia_semana_periodica: "",
      }));

      setAulasDisponibles([]);
      setAulaSeleccionada("");
      setFechasPeriodicas([]);
      setAulasPorFecha({});
      setSeleccionPorFecha({});
      setModoSeleccionAula("simple");
    } catch (e) {
      setErrores(e?.data || { general: "Error al conectar con el servidor" });
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);

    if (formulario.generar_periodica) {
      const fechasCalc = calcularFechasPeriodicas(
        formulario.fecha_inicio_periodo,
        formulario.fecha_fin_periodo,
        formulario.dia_semana_periodica
      );
      setCantidadConfirmacion(fechasCalc.length);
      setConfirmacionAbierta(true);
      return;
    }

    await enviarSolicitud();
  };

  return {
    formulario,
    aplicarCambios,
    mensaje,
    errores,

    modoSeleccionAula,
    aulasDisponibles,
    aulaSeleccionada,
    fechasPeriodicas,
    aulasPorFecha,
    seleccionPorFecha,

    setAulaSeleccionada,
    setSeleccionPorFecha,

    puedeBuscarAulas,
    buscando: cargandoAulas,
    buscarAulas,

    puedeEnviar,
    enviarFormulario,

    modal: {
      openConfirm: confirmacionAbierta,
      setOpenConfirm: setConfirmacionAbierta,
      confirmCount: cantidadConfirmacion,
      descripcionConfirm: descripcionConfirmacion,
      onConfirm: enviarSolicitud,
    },
  };
}
