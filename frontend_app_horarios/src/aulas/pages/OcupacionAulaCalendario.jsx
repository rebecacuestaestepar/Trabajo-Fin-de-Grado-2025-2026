// src/pages/OcupacionAulaCalendarPage.jsx
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import ToolbarAulaCalendar from "../components/calendario/ToolbarAulaCalendar";
import { useEventosAula } from "../hooks/useEventosAula";

function colorEventoPorTipo(arg) {
  const tipo = arg.event.extendedProps?.tipo;
  // Puntuales: verde, Periódicas: azul (cambia a tu gusto)
  if (tipo === "PUNTUAL") return { backgroundColor: "#16a34a", borderColor: "#16a34a" };
  if (tipo === "PERIODICA") return { backgroundColor: "#2563eb", borderColor: "#2563eb" };
  return {};
}

export default function OcupacionAulaCalendario({
  aulas = [], // [{id, nombre}] -> ajústalo a tu modelo real
}) {
  const navigate = useNavigate();
  const calRef = useRef(null);

  const [aulaId, setAulaId] = useState(aulas?.[0]?.id ?? "");
  const [tipo, setTipo] = useState("AMBAS"); // AMBAS | PUNTUAL | PERIODICA

  const { events, loading, error, setRange } = useEventosAula({ aulaId, tipo });

  const aulaSeleccionada = useMemo(
    () => aulas.find((a) => String(a.id) === String(aulaId)),
    [aulas, aulaId]
  );

  return (
    <div className="space-y-3">
      {/* Selector de aula (arriba, antes del calendario) */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">
            Ocupación del aula
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Aula:</label>
            <select
              value={aulaId}
              onChange={(e) => setAulaId(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              {aulas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre ?? a.codigo ?? `Aula ${a.id}`}
                </option>
              ))}
            </select>
          </div>

          {aulaSeleccionada && (
            <div className="text-xs text-slate-500">
              Mostrando: <span className="font-medium">{aulaSeleccionada.nombre ?? aulaSeleccionada.codigo}</span>
            </div>
          )}

          {loading && <div className="text-xs text-slate-500">Cargando…</div>}
          {error && <div className="text-xs text-rose-600">{error}</div>}
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"          // por defecto semanal
          firstDay={1}                        // lunes
          slotMinTime="08:30:00"
          slotMaxTime="20:30:00"
          nowIndicator={true}
          height="75vh"
          expandRows={true}
          events={events}
          eventColor="#334155"
          eventDidMount={(arg) => {
            // aplica colores según tipo
            const c = colorEventoPorTipo(arg);
            if (c.backgroundColor) {
              arg.el.style.backgroundColor = c.backgroundColor;
              arg.el.style.borderColor = c.borderColor;
            }
          }}
          datesSet={(arg) => {
            // FullCalendar te da el rango visible; lo usamos para pedir datos al backend
            setRange({ start: arg.start, end: arg.end });
          }}
          eventClick={(info) => {
            const tipoEv = info.event.extendedProps?.tipo;
            const id = info.event.id;

            // Si quieres ir "directamente a las características de la reserva puntual"
            if (tipoEv === "PUNTUAL") {
              navigate(`/reservas/puntuales/${id}`); // ajusta la ruta a tu app
              return;
            }

            // Si es periódica, puedes:
            // - ir a detalle de la serie
            // - o abrir modal
            // Por ahora lo dejo como ejemplo:
            // navigate(`/reservas/periodicas/${id}`);
          }}
          headerToolbar={false} // la reemplazamos con toolbar custom
        />

        {/* Toolbar custom (con filtro) */}
        <div className="mt-3">
          <ToolbarAulaCalendar
            title={calRef.current?.getApi?.().view?.title ?? ""}
            onPrev={() => calRef.current?.getApi?.().prev()}
            onNext={() => calRef.current?.getApi?.().next()}
            onToday={() => calRef.current?.getApi?.().today()}
            onView={(v) => calRef.current?.getApi?.().changeView(v)}
            view={calRef.current?.getApi?.().view?.type ?? "timeGridWeek"}
            tipo={tipo}
            setTipo={setTipo}
          />
        </div>

        {/* Leyenda */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#16a34a" }} />
            Puntuales
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#2563eb" }} />
            Periódicas
          </div>
        </div>
      </div>
    </div>
  );
}
