import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aprobarReserva, getReservasPendientes, rechazarReserva } from "../api/reservas.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatFechaHora(fechaISO, horaInicio, horaFin) {
  // fechaISO: "YYYY-MM-DD"
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
      ${ok ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}
      title={label}
    >
      <span className="text-sm">{ok ? trueIcon : falseIcon}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

export default function SolicitudesPendientes() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Opción A/B para Capacidad y Ordenadores
  const [modoCapacidad, setModoCapacidad] = useState("pills"); // "texto" | "pills"

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

  async function onAceptar(id) {
    setError(null);
    try {
      await aprobarReserva(id);
      // Quita de la lista al instante
      setReservas((prev) => prev.filter((r) => (r.id ?? r.idreserva) !== id));
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
      await cargar();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  function onEditar(id) {
    // si ya tienes ruta de editar:
    // navigate(`/reservas/pendientes/${id}/editar`);
    // de momento lo dejo preparado:
    navigate(`/reservas/pendientes/${id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Solicitudes pendientes
            </h1>
            <p className="mt-2 text-slate-600">
              Lista de solicitudes con estado <span className="font-semibold">Pendiente / Solicitada</span>.
            </p>
          </div>

          {/* Toggle visual para ver las 2 opciones de Capacidad/Ordenadores */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Capacidad/PCs:</span>
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ${
                modoCapacidad === "pills"
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setModoCapacidad("pills")}
            >
              Iconos/pills
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ${
                modoCapacidad === "texto"
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setModoCapacidad("texto")}
            >
              Texto
            </button>
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

          {!loading && !error && reservas.length === 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 ring-1 ring-slate-200">
              No hay solicitudes pendientes/solicitadas.
            </div>
          )}

          <ul className="mt-6 space-y-4">
            {reservas.map((r) => {
              const id = r.id ?? r.idreserva;

              const motivo = r.motivo ?? "(Sin motivo)";
              const correo = r.correo_responsable ?? r.correo ?? "(Sin correo)";
              const fechaHora = formatFechaHora(r.fecha, r.hora_inicio, r.hora_fin);

              const capacidad = r.capacidad_solicitada ?? "—";
              const pcs = r.num_ordenadores ?? "—";

              const aula = r.nombre_aula ?? "—";

              return (
                <li
                  key={id}
                  className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Bloque info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-semibold text-slate-900">
                          {motivo}
                        </p>
                        <p className="text-sm text-slate-600">
                          {correo}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                          <span className="font-medium">📅</span>
                          {fechaHora}
                        </span>

                        {modoCapacidad === "texto" ? (
                          <>
                            <span className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                              <span className="font-medium">Capacidad:</span> {capacidad}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                              <span className="font-medium">Ordenadores:</span> {pcs}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-indigo-200">
                              👥 <span className="font-semibold">{capacidad}</span>
                              <span className="hidden sm:inline">capacidad</span>
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">
                              💻 <span className="font-semibold">{pcs}</span>
                              <span className="hidden sm:inline">ordenadores</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Booleanos con iconos */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {boolIcon(r.altavoces, "Altavoces", "🔊", "🔇")}
                        {boolIcon(r.proyector, "Proyector", "📽️")}
                        {boolIcon(r.camaras, "Cámara", "📷")}
                        {boolIcon(r.enchufes, "Enchufes", "🔌")}
                      </div>

                      {/* Aula */}
                      <div className="mt-4">
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                          🏫 Aula: {aula}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      <button
                        onClick={() => onAceptar(id)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800"
                      >
                        Aceptar
                      </button>

                      <button
                        onClick={() => onRechazar(id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800"
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

          {/* Si quieres refresco automático cada X segundos, se puede,
              pero como dijiste que NO querías botón recargar, lo omitimos. */}
        </div>
      </div>
    </div>
  );
}
