// src/components/ReservaPuntualForm.jsx
import { useEffect, useMemo, useState } from "react";
import { buscarAulasDisponibles, solicitarReservaPuntual } from "../api/reservas";

/*
Contenedor para cada campo del formulario
  - label: etiqueta del campo (correo responsable, fecha, hora inicio, etc)
  - children: lo que se mete dentro (input, children, textarea)
  - hint: texto pequeño de ayuda debajo del campo (opcional)
*/
function Field({ label, children, hint }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
      <label className="text-sm font-medium text-slate-700 sm:col-span-4">
        {label}   
      </label>
      <div className="sm:col-span-8">
        {children}
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}

// Input estético con clases Tailwind. Textbox para cosas pequeñas, fechas, horas, números, etc.
function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

// Select estético con clases Tailwind. Ofrece una lista desplegable de opciones.
function SelectInput(props) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

// Textarea estético con clases Tailwind. Área de texto para entradas más largas.
function TextArea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

// Es un checkbox bonito para recursos (tratamos con ellos los booleanos)
function Check({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#7a1e1e]"
      />
      <span>{label}</span>
    </label>
  );
}

// Ventana emergente modal de confirmación
function ModalConfirm({ open, title, description, onCancel, onConfirm, confirmText = "Continuar" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-md !bg-[#7a1e1e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#651818]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Convierte un texto tipo "YYYY-MM-DD" a objeto fecha de Javascript Date y viceversa
function toDate(iso) {
  // iso: "YYYY-MM-DD"
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Esta función genera una lista de fechas periódicas entre fechaInicio y fechaFin
 */
function calcularFechasPeriodicas(fechaInicio, fechaFin, diaSemanaPeriodica) {
  if (!fechaInicio || !fechaFin || !diaSemanaPeriodica) return [];
  const start = toDate(fechaInicio);
  const end = toDate(fechaFin);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (start > end) return [];

  const targetJsDay = Number(diaSemanaPeriodica) % 7; // 1..5 => 1..5 correcto (L..V)

  // mover start al primer target day >= start
  const d = new Date(start);
  while (d.getDay() !== targetJsDay) d.setDate(d.getDate() + 1);
  const out = [];
  while (d <= end) {
    out.push(toISODate(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

export default function SolicitudReserva() {
  // Variables de estado donde guardamos los datos del formulario
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [correoResponsable, setCorreoResponsable] = useState("");
  const [numOrdenadores, setNumOrdenadores] = useState("");
  const [altavoces, setAltavoces] = useState(false);
  const [proyector, setProyector] = useState(false);
  const [camaras, setCamaras] = useState(false);
  const [enchufes, setEnchufes] = useState(false);

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);

  const [esPeriodica, setEsPeriodica] = useState(false);
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState("");
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState("");
  const [diaSemanaPeriodica, setDiaSemanaPeriodica] = useState("");

  // caso simple (no periódica) o caso común (periódica con aula común)
  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState("");

  // caso por-fecha
  const [fechasPeriodicas, setFechasPeriodicas] = useState([]);
  const [aulasPorFecha, setAulasPorFecha] = useState({}); // { "YYYY-MM-DD": [aulas] }
  const [seleccionPorFecha, setSeleccionPorFecha] = useState({}); // { "YYYY-MM-DD": "A-101" }

  // "simple" | "comun" | "por_fecha" La pantalla cambia según este modo
  const [modoSeleccionAula, setModoSeleccionAula] = useState("simple");

  const [cargandoAulas, setCargandoAulas] = useState(false);

  // Modal confirmación
  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmCount, setConfirmCount] = useState(0);

  // Si es periódica la fecha puesto por el usuario se copia a fecha inicio período
  useEffect(() => {
    if (esPeriodica) setFechaInicioPeriodo(fecha);
  }, [fecha, esPeriodica]);

  // si el usuario cambia periodicidad, limpia selecciones
  useEffect(() => {
    setAulasDisponibles([]);
    setAulaSeleccionada("");
    setFechasPeriodicas([]);
    setAulasPorFecha({});
    setSeleccionPorFecha({});
    setModoSeleccionAula(esPeriodica ? "comun" : "simple");
  }, [esPeriodica]);

  // Puede buscar aulas si los campos obligatorios están completos
  const puedeBuscarAulas = useMemo(() => {
    if (!fecha || !horaInicio || !horaFin || String(capacidad).trim() === "") return false;
    if (!esPeriodica) return true;
    return !!fechaInicioPeriodo && !!fechaFinPeriodo && !!diaSemanaPeriodica;
  }, [fecha, horaInicio, horaFin, capacidad, esPeriodica, fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica]);

  // Esto ocurre al pulsar el botón "Buscar aulas disponibles"
  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setCargandoAulas(true);

    const numOrdenadoresPayload = numOrdenadores === "" ? 0 : Number(numOrdenadores);

    // Preparamos el json que se manda la backend
    const payload = {
      fecha: esPeriodica ? undefined : fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      capacidad_solicitada: Number(capacidad),
      num_ordenadores: numOrdenadoresPayload,
      altavoces,
      proyector,
      camaras,
      enchufes,
      generar_periodica: esPeriodica,
    };

    // SI es periódica se añaden los campos correspondientes a la periodicidad
    if (esPeriodica) {
      payload.fecha_inicio_periodo = fechaInicioPeriodo;
      payload.fecha_fin_periodo = fechaFinPeriodo;
      payload.dia_semana_periodica = Number(diaSemanaPeriodica);
    }

    try {
      // Llamamos al endpoint de búsqueda de aulas disponibles del frontend
      const data = await buscarAulasDisponibles(payload);

      if (!esPeriodica) {
        // Si no es periódica el modo de selección es simple, y selecciona por defecto la primera aula (si hay)
        setModoSeleccionAula("simple");
        setAulasDisponibles(data.aulas || []);
        setAulaSeleccionada(data.aulas?.length > 0 ? data.aulas[0].nombre : "");
        setFechasPeriodicas([]);
        setAulasPorFecha({});
        setSeleccionPorFecha({});
        return;
      }

      // periódica: esperamos modo + fechas + (aulas_comunes | aulas_por_fecha)
      const modo = data.modo;
      const fechas = data.fechas || calcularFechasPeriodicas(fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica);
      setFechasPeriodicas(fechas);

      // Rellena un select único
      if (modo === "comun") {
        const comunes = data.aulas_comunes || [];
        setModoSeleccionAula("comun");
        setAulasDisponibles(comunes);
        setAulaSeleccionada(comunes.length > 0 ? comunes[0].nombre : "");
        setAulasPorFecha({});
        setSeleccionPorFecha({});
      } else {
        // Creamos la selección por fecha
        const apf = data.aulas_por_fecha || {};
        setModoSeleccionAula("por_fecha");
        setAulasDisponibles([]); // no aplica aquí
        setAulaSeleccionada("");

        setAulasPorFecha(apf);

        // selección por defecto: primera aula de cada fecha (si existe)
        const nextSel = {};
        for (const f of fechas) {
          const lista = apf[f] || [];
          nextSel[f] = lista.length > 0 ? lista[0].nombre : "";
        }
        setSeleccionPorFecha(nextSel);
      }
    } catch (error) {
      setErrores({ general: "Error al conectar con el servidor" });
      setAulasDisponibles([]);
      setAulaSeleccionada("");
      setFechasPeriodicas([]);
      setAulasPorFecha({});
      setSeleccionPorFecha({});
      setModoSeleccionAula(esPeriodica ? "comun" : "simple");
    } finally {
      setCargandoAulas(false);
    }
  };
  // Puede enviar la solicitud si los campos obligatorios están completos
  const puedeEnviar = useMemo(() => {
    // Si no es periódica, se habilita cuando los campos obligatorios + aula están completos
    if (!fecha || !horaInicio || !horaFin || String(capacidad).trim() === "" || !correoResponsable) return false;
    if (!esPeriodica) return !!aulaSeleccionada; // si en tu backend permites vacío, puedes relajarlo
    // Si es periódica: calculamos las fechas
    const fechasCalc = calcularFechasPeriodicas(fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica);
    if (fechasCalc.length === 0) return false;
    
    // Solamente necesitas el aula común a las fechas
    if (modoSeleccionAula === "comun") return !!aulaSeleccionada;
    // Necesitas que tengan aulas seleccionadas todas las fechas
    if (modoSeleccionAula === "por_fecha") {
      // todas las fechas deben tener un aula seleccionada
      return fechasCalc.every((f) => !!seleccionPorFecha[f]);
    }
    return false;
  }, [
    fecha, horaInicio, horaFin, capacidad, correoResponsable,
    esPeriodica, fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica,
    modoSeleccionAula, aulaSeleccionada, seleccionPorFecha,
  ]);

  // Al pulsar "Enviar solicitud" abrir modal si periódica, si no periódica enviar directo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);

    // Solo envía en caso de que pulse Confirmar en el modal
    if (esPeriodica) {
      const fechasCalc = calcularFechasPeriodicas(fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica);
      setConfirmCount(fechasCalc.length);
      setOpenConfirm(true);
      return;
    }

    // no periódica: envía directo
    await enviarSolicitudReal();
  };

  // Hacemos el json para enviar la solicitud al backend para la creación de la reserva(s)
  const enviarSolicitudReal = async () => {
    setOpenConfirm(false);

    const numOrdenadoresPayload = numOrdenadores === "" ? 0 : Number(numOrdenadores);

    const payload = {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      motivo,
      capacidad_solicitada: Number(capacidad),
      correo_responsable: correoResponsable,
      num_ordenadores: numOrdenadoresPayload,
      altavoces,
      proyector,
      camaras,
      enchufes,
      generar_periodica: esPeriodica,
    };

    if (!esPeriodica) {
      payload.nombre_aula = aulaSeleccionada || "";
    } else {
      payload.fecha_inicio_periodo = fechaInicioPeriodo;
      payload.fecha_fin_periodo = fechaFinPeriodo;
      payload.dia_semana_periodica = Number(diaSemanaPeriodica);
      
      // En caso de aula común todas las reservas usan la misma aula
      if (modoSeleccionAula === "comun") {
        payload.nombre_aula = aulaSeleccionada || "";
      } else if (modoSeleccionAula === "por_fecha") {
        // Enviamos selección por fecha (el backend creará una reserva por fecha con su aula)
        payload.aulas_por_fecha = seleccionPorFecha; // { "YYYY-MM-DD": "A-101", ... }
      }
    }

    try {
      // Llamamos al endpoint de solicitud de reserva puntual del frontend y muestra mensaje de éxito
      const data = await solicitarReservaPuntual(payload);

      setMensaje(data.message || "Reserva(s) creada(s) correctamente");

      // limpiar formulario
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
      setCapacidad("");
      setCorreoResponsable("");
      setNumOrdenadores("");
      setAltavoces(false);
      setProyector(false);
      setCamaras(false);
      setEnchufes(false);
      setEsPeriodica(false);
      setFechaInicioPeriodo("");
      setFechaFinPeriodo("");
      setDiaSemanaPeriodica("");
      setAulasDisponibles([]);
      setAulaSeleccionada("");
      setFechasPeriodicas([]);
      setAulasPorFecha({});
      setSeleccionPorFecha({});
      setModoSeleccionAula("simple");
    } catch (error) {
      setErrores(error?.data || { general: "Error al conectar con el servidor" });
    }
  };

  const descripcionConfirm = useMemo(() => {
    if (!esPeriodica) return "";
    const fechasCalc = calcularFechasPeriodicas(fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica);
    const n = fechasCalc.length;
    const inicio = fechaInicioPeriodo || "(sin inicio)";
    const fin = fechaFinPeriodo || "(sin fin)";
    return `Vas a generar ${n} reserva(s) periódica(s) entre ${inicio} y ${fin}. Revisa especialmente el año antes de continuar.`;
  }, [esPeriodica, fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
      <ModalConfirm
        open={openConfirm}
        title={`¿Seguro que quieres generar ${confirmCount} reserva(s)?`}
        description={descripcionConfirm}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={enviarSolicitudReal}
      />

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-[#7a1e1e]/60 bg-white shadow-sm">
          <div className="border-b border-[#7a1e1e]/30 px-6 py-5">
            <h1 className="text-center text-lg font-semibold tracking-wide text-slate-900">
              SOLICITAR RESERVA PUNTUAL
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {/* Datos principales */}
            <div className="space-y-4">
              <Field label="Correo responsable">
                <TextInput
                  type="email"
                  value={correoResponsable}
                  onChange={(e) => setCorreoResponsable(e.target.value)}
                  required
                  placeholder="nombre.apellido@alu.ubu.es"
                />
              </Field>

              <Field label="Motivo">
                <TextArea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Describe brevemente el motivo de la reserva…"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fecha">
                  <TextInput
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Capacidad solicitada">
                  <TextInput
                    type="number"
                    value={capacidad}
                    onChange={(e) => setCapacidad(e.target.value)}
                    required
                    min={0}
                    placeholder="Ej: 30"
                  />
                </Field>

                <Field label="Hora inicio">
                  <TextInput
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Hora fin">
                  <TextInput
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Nº ordenadores">
                  <TextInput
                    type="number"
                    value={numOrdenadores}
                    onChange={(e) => setNumOrdenadores(e.target.value)}
                    min={0}
                    placeholder="Opcional"
                  />
                </Field>
              </div>
            </div>

            {/* Recursos */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                Recursos solicitados
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Check checked={altavoces} onChange={(e) => setAltavoces(e.target.checked)} label="Necesito altavoces" />
                <Check checked={proyector} onChange={(e) => setProyector(e.target.checked)} label="Necesito proyector" />
                <Check checked={camaras} onChange={(e) => setCamaras(e.target.checked)} label="Necesito cámaras" />
                <Check checked={enchufes} onChange={(e) => setEnchufes(e.target.checked)} label="Necesito enchufes" />
              </div>
            </div>

            {/* Periodicidad */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={esPeriodica}
                    onChange={(e) => setEsPeriodica(e.target.checked)}
                    className="h-4 w-4 accent-[#7a1e1e]"
                  />
                  Generar reserva de forma periódica
                </label>
                <span className="text-xs text-slate-500">(Opcional)</span>
              </div>

              {esPeriodica && (
                <div className="mt-4 space-y-4 rounded-md border border-[#7a1e1e]/20 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Configuración de reserva periódica
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Fecha inicio">
                      <TextInput
                        type="date"
                        value={fechaInicioPeriodo}
                        onChange={(e) => setFechaInicioPeriodo(e.target.value)}
                      />
                    </Field>

                    <Field label="Fecha fin">
                      <TextInput
                        type="date"
                        value={fechaFinPeriodo}
                        onChange={(e) => setFechaFinPeriodo(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Día de la semana">
                    <SelectInput
                      value={diaSemanaPeriodica}
                      onChange={(e) => setDiaSemanaPeriodica(e.target.value)}
                    >
                      <option value="">Selecciona un día</option>
                      <option value="1">Lunes</option>
                      <option value="2">Martes</option>
                      <option value="3">Miércoles</option>
                      <option value="4">Jueves</option>
                      <option value="5">Viernes</option>
                    </SelectInput>
                  </Field>

                  {/* Preview count */}
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    Se generarán{" "}
                    <span className="font-semibold text-slate-800">
                      {calcularFechasPeriodicas(fechaInicioPeriodo, fechaFinPeriodo, diaSemanaPeriodica).length}
                    </span>{" "}
                    reserva(s) con esta configuración.
                  </div>
                </div>
              )}
            </div>

            {/* Aulas */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Aula candidata
                </h2>

                <button
                  type="button"
                  onClick={buscarAulas}
                  disabled={cargandoAulas || !puedeBuscarAulas}
                  className={[
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
                    "bg-white text-[#7a1e1e] ring-1 ring-[#7a1e1e]/50",
                    "hover:bg-[#7a1e1e]/5",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  ].join(" ")}
                >
                  {cargandoAulas ? "Buscando aulas..." : "Buscar aulas candidatas"}
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* No periódica o periódica con aula común */}
                {(modoSeleccionAula === "simple" || modoSeleccionAula === "comun") && (
                  <Field
                    label="Aula"
                    hint={
                      aulasDisponibles.length > 0
                        ? "Por defecto se selecciona la primera aula disponible. Puedes escoger otra."
                        : 'Pulsa "Buscar aulas candidatas" para cargar opciones.'
                    }
                  >
                    <SelectInput
                      value={aulaSeleccionada}
                      onChange={(e) => setAulaSeleccionada(e.target.value)}
                      disabled={aulasDisponibles.length === 0}
                    >
                      {aulasDisponibles.length === 0 ? (
                        <option value="">(No existen aulas disponibles para los criterios seleccionados)</option>
                      ) : (
                        aulasDisponibles.map((a) => (
                          <option key={a.nombre} value={a.nombre}>
                            {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                          </option>
                        ))
                      )}
                    </SelectInput>
                  </Field>
                )}

                {/* Periódica sin aula común => selección por fecha */}
                {modoSeleccionAula === "por_fecha" && (
                  <div className="space-y-3">
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      No existe un aula que esté libre para <b>todas</b> las fechas.
                      Selecciona un aula para cada fecha.
                    </div>

                    {fechasPeriodicas.map((f) => {
                      const lista = aulasPorFecha[f] || [];
                      const value = seleccionPorFecha[f] || "";
                      return (
                        <div key={f} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-2 text-xs font-semibold text-slate-700">
                            Fecha: {f}
                          </div>
                          <SelectInput
                            value={value}
                            onChange={(e) =>
                              setSeleccionPorFecha((prev) => ({ ...prev, [f]: e.target.value }))
                            }
                            disabled={lista.length === 0}
                          >
                            {lista.length === 0 ? (
                              <option value="">(Sin aulas disponibles en esta fecha)</option>
                            ) : (
                              lista.map((a) => (
                                <option key={a.nombre} value={a.nombre}>
                                  {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                                </option>
                              ))
                            )}
                          </SelectInput>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={!puedeEnviar}
                className={[
                  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                  "!bg-[#7a1e1e] hover:bg-[#651818] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e]/30",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              >
                Enviar solicitud
              </button>
            </div>

            {/* Mensajes */}
            {mensaje && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {mensaje}
              </div>
            )}

            {errores && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-800">Errores</p>
                <pre className="mt-2 overflow-auto text-xs text-rose-800">
                  {JSON.stringify(errores, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
