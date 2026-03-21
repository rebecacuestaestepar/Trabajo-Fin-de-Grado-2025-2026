import IconoBool from "../ui/IconoBool";
import { formatearFechaHora } from "../ui/fecha"; 

function badgeEstado(estadoRaw) {
  const estado = String(estadoRaw ?? "").trim().toUpperCase();


  if (estado === "P" || estado === "PENDIENTE") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }
  if (estado === "A" || estado === "APROBADA" || estado === "APROBADO") {
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
  }
  if (estado === "R" || estado === "RECHAZADA" || estado === "RECHAZADO") {
    return "bg-rose-50 text-rose-800 ring-1 ring-rose-200";
  }
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
}

function textoEstado(estadoRaw) {
  const estado = String(estadoRaw ?? "").trim().toUpperCase();
  if (estado === "P") return "Pendiente";
  if (estado === "A") return "Aprobada";
  if (estado === "R") return "Rechazada";
  if (!estado) return "—";
  return estadoRaw;
}

export default function TarjetaReserva({
  reserva,
  estaSeleccionada,
  alAlternarSeleccion,

  alAceptar,
  alRechazar,
  alEliminar,
  alEditar,

  mostrarEstado = true,
}) {
  const id = reserva.id ?? reserva.idreserva;

  const motivo = reserva.motivo ?? "(Sin motivo)";
  const correo = reserva.correo_responsable ?? reserva.correo ?? "(Sin correo)";
  const fechaHora = formatearFechaHora(reserva.fecha, reserva.hora_inicio, reserva.hora_fin);

  const capacidad = reserva.capacidad_solicitada ?? "—";
  const pcs = reserva.num_ordenadores_solicitados ?? reserva.num_ordenadores ?? "—";
  const aula = reserva.nombre_aula ?? "—";

  const estadoRaw = reserva.estado;

  const estadoStr = String(estadoRaw ?? "").trim().toUpperCase();
  const esPendiente = estadoStr === "P" || estadoStr === "PENDIENTE";

  return (
    <li
      className={`group rounded-2xl bg-white p-5 shadow-sm ring-1 transition hover:shadow-md
        ${estaSeleccionada ? "ring-indigo-300" : "ring-slate-200"}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={estaSeleccionada}
              onChange={alAlternarSeleccion}
              className="mt-1 h-4 w-4 rounded border-slate-300"
              aria-label={`Seleccionar reserva ${motivo}`}
            />
          
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{motivo}</p>
                    
                        {mostrarEstado && (
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeEstado(
                            estadoRaw
                            )}`}
                            title={`Estado: ${textoEstado(estadoRaw)}`}
                        >
                            Estado: {textoEstado(estadoRaw)}
                        </span>
                        )}
                </div>
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
            <IconoBool
              valor={reserva.altavoces_solicitados ?? reserva.altavoces}
              etiqueta="Altavoces"
              iconoVerdadero="🔊"
              iconoFalso="🔇"
            />
            <IconoBool
              valor={reserva.proyector_solicitado ?? reserva.proyector}
              etiqueta="Proyector"
              iconoVerdadero="📽️"
            />
            <IconoBool
              valor={reserva.camara_solicitada ?? reserva.camara ?? reserva.camaras}
              etiqueta="Cámara"
              iconoVerdadero="📷"
            />
            <IconoBool
              valor={reserva.enchufes_solicitados ?? reserva.enchufes}
              etiqueta="Enchufes"
              iconoVerdadero="🔌"
            />
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
              Aula: {aula}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-stretch">
          {esPendiente ? (
            <>
              <button
                onClick={() => alAceptar?.(id)}
                className="rounded-lg !bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800"
              >
                Aceptar
              </button>

              <button
                onClick={() => alRechazar?.(id)}
                className="rounded-lg !bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800"
              >
                Rechazar
              </button>
            </>
          ) : (
            /* Si no es pendiente, mostramos el botón de eliminar*/
            <button
              onClick={() => alEliminar?.(id)}
              className="rounded-lg !bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:!bg-slate-800"
              title="Eliminar"
            >
              Eliminar
            </button>
          )}

          <button
            onClick={() => alEditar?.(id)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            title="Editar"
          >
            ✏️ Editar
          </button>
        </div>
      </div>
    </li>
  );
}
