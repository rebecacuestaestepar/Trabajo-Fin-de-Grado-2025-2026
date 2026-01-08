// src/components/ReservaPuntualForm.jsx
import { useEffect, useMemo, useState } from "react";
import { buscarAulasDisponibles, solicitarReservaPuntual } from "../api/reservas";

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

export default function SolicitudReserva() {
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

  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState("");
  const [cargandoAulas, setCargandoAulas] = useState(false);

  useEffect(() => {
    if (esPeriodica) setFechaInicioPeriodo(fecha);
  }, [fecha, esPeriodica]);

  const puedeBuscarAulas = useMemo(() => {
    return !!fecha && !!horaInicio && !!horaFin && String(capacidad).trim() !== "";
  }, [fecha, horaInicio, horaFin, capacidad]);

  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setCargandoAulas(true);

    const numOrdenadoresPayload = numOrdenadores === "" ? 0 : Number(numOrdenadores);

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

    if (esPeriodica) {
      payload.fecha_inicio_periodo = fechaInicioPeriodo;
      payload.fecha_fin_periodo = fechaFinPeriodo;
      payload.dia_semana_periodica = Number(diaSemanaPeriodica);
    }

    try {
      const data = await buscarAulasDisponibles(payload);

      setAulasDisponibles(data.aulas || []);

      if (data.aulas?.length > 0) setAulaSeleccionada(data.aulas[0].nombre);
      else setAulaSeleccionada("");
    } catch (error) {
      setErrores({ general: "Error al conectar con el servidor" });
      setAulasDisponibles([]);
      setAulaSeleccionada("");
    } finally {
      setCargandoAulas(false);
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);

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
      nombre_aula: aulaSeleccionada || "",
    };

    if (esPeriodica) {
      payload.fecha_inicio_periodo = fechaInicioPeriodo;
      payload.fecha_fin_periodo = fechaFinPeriodo;
      payload.dia_semana_periodica = Number(diaSemanaPeriodica);
    }

    try {
      const data = await solicitarReservaPuntual(payload);

      setMensaje(data.message || "Reserva creada correctamente");

      // limpiar formulario (igual que lo tienes)
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
    } catch (error) {
      setErrores(error?.data || { general: "Error al conectar con el servidor" });
    }

  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
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
                <span className="text-xs text-slate-500">
                  (Opcional)
                </span>
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

              <div className="mt-4">
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
                      <option value="">(Sin aulas cargadas)</option>
                    ) : (
                      aulasDisponibles.map((a) => (
                        <option key={a.nombre} value={a.nombre}>
                          {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                        </option>
                      ))
                    )}
                  </SelectInput>
                </Field>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[#7a1e1e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#651818] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e]/30"
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
