import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aprobarReserva, getReservasPendientes, rechazarReserva, aprobarReservasMasivo, rechazarReservasMasivo } from "../api/reservas.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatFechaHora(fechaISO, horaInicio, horaFin) {
  if (!fechaISO) return "—";
  const [y, m, d] = fechaISO.split("-");
  const fecha = `${pad2(d)}/${pad2(m)}/${y}`;
  const hi = horaInicio?.slice(0, 5) ?? "??:??";
  const hf = horaFin?.slice(0, 5) ?? "??:??";
  return `${fecha} ${hi}-${hf}`;
}

function boolIcon(value, label, trueIcon, falseIcon = "—") {
  const ok = !!value;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
      ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"
      }`}
      title={label}
    >
      <span className="text-sm">{ok ? trueIcon : falseIcon}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function normalize(s) {
  return String(s ?? "").trim().toLowerCase();
}

function isFechaInRange(fechaISO, desdeISO, hastaISO) {
  if (!fechaISO) return false;
  const f = fechaISO; // YYYY-MM-DD
  if (desdeISO && f < desdeISO) return false;
  if (hastaISO && f > hastaISO) return false;
  return true;
}

export default function SolicitudesPendientes() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState(null);

  // Mostrar/ocultar panel de filtrado
  const [showFiltros, setShowFiltros] = useState(false);

  // Qué filtros están activos (los elige el usuario)
  const [useMotivo, setUseMotivo] = useState(false);
  const [useResponsable, setUseResponsable] = useState(false);
  const [useRango, setUseRango] = useState(false);

  // Valores de filtros
  const [fMotivo, setFMotivo] = useState("");
  const [fResponsable, setFResponsable] = useState("");
  const [fDesde, setFDesde] = useState(""); // YYYY-MM-DD
  const [fHasta, setFHasta] = useState(""); // YYYY-MM-DD

  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const navigate = useNavigate();

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await getReservasPendientes();
      setReservas(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Lista filtrada (aplica solo los filtros activados)
  const reservasFiltradas = useMemo(() => {
    const m = normalize(fMotivo);
    const r = normalize(fResponsable);

    return reservas.filter((item) => {
      const motivo = normalize(item.motivo ?? "");
      const correo = normalize(item.correo_responsable ?? item.correo ?? "");
      const fechaISO = item.fecha; // YYYY-MM-DD

      if (useMotivo && m && !motivo.includes(m)) return false;
      if (useResponsable && r && !correo.includes(r)) return false;

      if (useRango && (fDesde || fHasta)) {
        if (!isFechaInRange(fechaISO, fDesde, fHasta)) return false;
      }

      return true;
    });
  }, [reservas, useMotivo, useResponsable, useRango, fMotivo, fResponsable, fDesde, fHasta]);

  const filteredIds = useMemo(
    () => reservasFiltradas.map((x) => x.id ?? x.idreserva),
    [reservasFiltradas]
  );

  const selectedCount = selectedIds.size;

  const allVisibleSelected = useMemo(() => {
    if (filteredIds.length === 0) return false;
    return filteredIds.every((id) => selectedIds.has(id));
  }, [filteredIds, selectedIds]);

  const someVisibleSelected = useMemo(() => {
    return filteredIds.some((id) => selectedIds.has(id));
  }, [filteredIds, selectedIds]);

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const shouldSelect = !filteredIds.every((id) => next.has(id));

      if (shouldSelect) filteredIds.forEach((id) => next.add(id));
      else filteredIds.forEach((id) => next.delete(id));

      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function limpiarFiltros() {
    // desactivas y limpias
    setUseMotivo(false);
    setUseResponsable(false);
    setUseRango(false);

    setFMotivo("");
    setFResponsable("");
    setFDesde("");
    setFHasta("");
  }

  async function onAceptar(id) {
    setError(null);
    try {
      await aprobarReserva(id);
      setReservas((prev) => prev.filter((r) => (r.id ?? r.idreserva) !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await cargar();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function onRechazar(id) {
    setError(null);
    try {
      await rechazarReserva(id);
      setReservas((prev) => prev.filter((r) => (r.id ?? r.idreserva) !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await cargar();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function onAceptarSeleccionadas() {
    if (selectedIds.size === 0) return;
    setAccionando(true);
    setError(null);

    const ids = Array.from(selectedIds);

    try {
      await aprobarReservasMasivo(ids);
      setReservas((prev) => prev.filter((r) => !selectedIds.has(r.id ?? r.idreserva)));
      clearSelection();
      await cargar();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setAccionando(false);
    }
  }

  async function onRechazarSeleccionadas() {
    if (selectedIds.size === 0) return;
    setAccionando(true);
    setError(null);

    const ids = Array.from(selectedIds);

    try {
      await rechazarReservasMasivo(ids);
      setReservas((prev) => prev.filter((r) => !selectedIds.has(r.id ?? r.idreserva)));
      clearSelection();
      await cargar();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setAccionando(false);
    }
  }

  function onEditar(id) {
    navigate(`/reservas/pendientes/${id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Solicitudes pendientes
            </h1>
            <p className="mt-2 text-slate-600">
              Lista de solicitudes con estado <span className="font-semibold">Pendiente</span>.
            </p>
          </div>

          {/* Barra: Filtrado + Selección + Acciones masivas */}
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFiltros((v) => !v)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition
                    ${
                      showFiltros
                        ? "!bg-slate-900 text-white ring-slate-900"
                        : "!bg-white text-slate-800 ring-slate-200 hover:!bg-slate-50"
                    }`}
                >
                  Filtrado
                </button>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                    }}
                    onChange={toggleSelectAllVisible}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Seleccionar todas (vista actual)
                </label>

                <span className="text-sm text-slate-600">
                  Mostrando <span className="font-semibold">{reservasFiltradas.length}</span> /{" "}
                  <span className="font-semibold">{reservas.length}</span>
                  {" · "}
                  Seleccionadas: <span className="font-semibold">{selectedCount}</span>
                </span>

                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    Quitar selección
                  </button>
                )}
              </div>

              {/* ✅ Reservamos SIEMPRE el hueco de los botones masivos para que no cambie el alto */}
              <div
                className={`flex flex-wrap gap-2 min-h-[40px] items-center justify-start sm:justify-end
                  ${selectedCount > 0 ? "" : "invisible pointer-events-none"}`}
                aria-hidden={selectedCount === 0}
              >
                <button
                  type="button"
                  disabled={accionando}
                  onClick={onAceptarSeleccionadas}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                    ${accionando ? "!bg-emerald-300 cursor-not-allowed" : "!bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"}`}
                >
                  Aceptar reservas
                </button>

                <button
                  type="button"
                  disabled={accionando}
                  onClick={onRechazarSeleccionadas}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                    ${accionando ? "!bg-red-300 cursor-not-allowed" : "!bg-red-600 hover:bg-red-700 active:bg-red-800"}`}
                >
                  Rechazar reservas
                </button>
              </div>
            </div>

            {/* ✅ Reservamos SIEMPRE el hueco del panel de filtros para que no haya salto */}
            {/* Panel de filtros: se despliega / se colapsa sin ocupar espacio cuando está cerrado */}
            <div
              className={`mt-4 grid transition-[grid-template-rows,opacity] duration-200 ease-out
                ${showFiltros ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={useMotivo}
                        onChange={(e) => setUseMotivo(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Motivo
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={useResponsable}
                        onChange={(e) => setUseResponsable(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Responsable
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={useRango}
                        onChange={(e) => setUseRango(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Rango de fechas
                    </label>

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Limpiar filtros
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
                    {useMotivo && (
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700">Motivo</label>
                        <input
                          value={fMotivo}
                          onChange={(e) => setFMotivo(e.target.value)}
                          placeholder="Ej: Curso CSS"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    )}

                    {useResponsable && (
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Responsable (correo)
                        </label>
                        <input
                          value={fResponsable}
                          onChange={(e) => setFResponsable(e.target.value)}
                          placeholder="Ej: juan@..."
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    )}

                    {useRango && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">Desde</label>
                          <input
                            type="date"
                            value={fDesde}
                            onChange={(e) => setFDesde(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">Hasta</label>
                          <input
                            type="date"
                            value={fHasta}
                            onChange={(e) => setFHasta(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                          />
                        </div>
                      </>
                    )}

                    {!useMotivo && !useResponsable && !useRango && (
                      <div className="md:col-span-12 text-sm text-slate-600">
                        Activa algún filtro arriba para que aparezcan sus campos.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6">
          {loading && (
            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-slate-700">Cargando solicitudes…</p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {!loading && !error && reservasFiltradas.length === 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 ring-1 ring-slate-200">
              No hay solicitudes pendientes/solicitadas con estos filtros.
            </div>
          )}

          <ul className="mt-6 space-y-4">
            {reservasFiltradas.map((r) => {
              const id = r.id ?? r.idreserva;

              const motivo = r.motivo ?? "(Sin motivo)";
              const correo = r.correo_responsable ?? r.correo ?? "(Sin correo)";
              const fechaHora = formatFechaHora(r.fecha, r.hora_inicio, r.hora_fin);

              const capacidad = r.capacidad_solicitada ?? "—";
              const pcs = r.num_ordenadores_solicitados ?? "—";
              const aula = r.nombre_aula ?? "—";

              const isSelected = selectedIds.has(id);

              return (
                <li
                  key={id}
                  className={`group rounded-2xl bg-white p-5 shadow-sm ring-1 transition hover:shadow-md
                    ${isSelected ? "ring-indigo-300" : "ring-slate-200"}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(id)}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                          aria-label={`Seleccionar reserva ${motivo}`}
                        />

                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-slate-900">{motivo}</p>
                          <p className="text-sm text-slate-600">{correo}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                          <span className="font-medium">📅</span>
                          {fechaHora}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-indigo-200">
                          👥 <span className="font-semibold">{capacidad}</span>
                          <span className="hidden sm:inline">capacidad</span>
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
                          💻 <span className="font-semibold">{pcs}</span>
                          <span className="hidden sm:inline">ordenadores</span>
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {boolIcon(r.altavoces_solicitados, "Altavoces", "🔊", "🔇")}
                        {boolIcon(r.proyector_solicitado, "Proyector", "📽️")}
                        {boolIcon(r.camara_solicitada, "Cámara", "📷")}
                        {boolIcon(r.enchufes_solicitados, "Enchufes", "🔌")}
                      </div>

                      <div className="mt-4">
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                          Aula: {aula}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      <button
                        onClick={() => onAceptar(id)}
                        className="rounded-lg !bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800"
                      >
                        Aceptar
                      </button>

                      <button
                        onClick={() => onRechazar(id)}
                        className="rounded-lg !bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800"
                      >
                        Rechazar
                      </button>

                      <button
                        onClick={() => onEditar(id)}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
