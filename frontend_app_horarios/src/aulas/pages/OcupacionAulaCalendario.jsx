// src/aulas/pages/OcupacionAulaCalendarPage.jsx
import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import ToolbarAulaCalendar from "../components/calendario/ToolbarAulaCalendar";
import { useEventosAula } from "../hooks/useEventosAula";
import BotonVolver from "../../reservas/formulario-componentes/ui/BotonVolver";
import LeyendaAulas from "../components/calendario/LeyendaAulas";
import { generarMapaColores } from "../ocupacion-utiles/coloresAulas";

function colorEventoPorTipo(arg) {
  const tipo = arg.event.extendedProps?.tipo;
  // Puntuales: verde, Periódicas: azul
  if (tipo === "PUNTUAL") return { backgroundColor: "#16a34a", borderColor: "#16a34a" };
  if (tipo === "PERIODICA") return { backgroundColor: "#2563eb", borderColor: "#2563eb" };
  return {};
}

export default function OcupacionAulaCalendario({
  aulas = [], // [{id, nombre}] -> ajústalo a tu modelo real
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const calRef = useRef(null);

  // Leemos los parámetros de la URL para saber qué aula(s) mostrar
  const [searchParams] = useSearchParams();
  const aulasSeleccionadas = searchParams.getAll("aula");
  //const [aulaNombre, setAulaNombre] = useState(aulas?.[0]?.nombre ?? "");


  const [tipo, setTipo] = useState("AMBAS"); // AMBAS | PUNTUAL | PERIODICA

  const { events, loading, error, setRange } = useEventosAula({ aulasNombres: aulasSeleccionadas, tipo });

  const mapaColores = useMemo(() => {
    return generarMapaColores(aulasSeleccionadas);
  }, [aulasSeleccionadas.join(",")]);

  // Función paa manejar ir con el click a la vista de día
  const handleDateClick = (arg) => {
    const calendarApi = calRef.current.getApi();
    // 'timeGridDay' es la vista de día con horas, ideal para aulas
    calendarApi.changeView('timeGridDay', arg.date);
  };

  return (
    <div className="space-y-3">
      <BotonVolver fallback="/ocupacion-aulas" />
    
      {/* Cabecera indicando qué aulas se están mostrando */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">
            Ocupación de: {aulasSeleccionadas.join(", ") || "Ninguna aula seleccionada"}
          </div>
        </div>
      </div>

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
        <div className="mt-3">
          <LeyendaAulas mapaColores={mapaColores} />
        </div>
        {/*<div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#16a34a" }} />
            Puntuales
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#2563eb" }} />
            Periódicas
          </div>
        </div>*/}

      {/* Calendario */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"          // por defecto semanal
          firstDay={1}                        // lunes
          //slotMinTime="08:30:00"
          //slotMaxTime="20:30:00"
          nowIndicator={true}
          height="75vh"
          expandRows={true}
          events={events}
          //eventColor="#334155"

          navLinks={true} // Para que los días sean links nativos
          dateClick={handleDateClick} // Captura el clic en celdas vacías

          eventDidMount={(arg) => {
            // aplica colores según tipo
            /*const c = colorEventoPorTipo(arg);
            if (c.backgroundColor) {
              arg.el.style.backgroundColor = c.backgroundColor;
              arg.el.style.borderColor = c.borderColor;
            }*/
            const tipoEv = arg.event.extendedProps?.tipo;
            const aulaEv = arg.event.extendedProps?.aula;

            // Cogemos los colores directamente del mapa usando el nombre del aula
            const coloresAula = mapaColores[aulaEv] || { oscuro: "#475569", claro: "#cbd5e1" };
            
            const bgColor = tipoEv === "PUNTUAL" ? coloresAula.oscuro : coloresAula.claro;

            arg.el.style.backgroundColor = bgColor;
            arg.el.style.borderColor = bgColor;
            arg.el.style.color = tipoEv === "PERIODICA" ? "#1e293b" : "#ffffff";
          }}
          datesSet={(arg) => {
            // FullCalendar te da el rango visible; lo usamos para pedir datos al backend
            setRange((prev) => {
              // Si no había rango previo, lo guardamos
              if (!prev) return { start: arg.start, end: arg.end };
              
              // Comparamos el valor numérico de las fechas (milisegundos)
              if (
                prev.start.getTime() === arg.start.getTime() &&
                prev.end.getTime() === arg.end.getTime()
              ) {
                return prev; // No hacemos NADA, evitando el render y el bucle
              }
              
              // Solo actualizamos si las fechas son genuinamente distintas
              return { start: arg.start, end: arg.end };
            });
          }}
          eventClick={(info) => {
            const tipoEv = info.event.extendedProps?.tipo;
            const id = info.event.id;

            // Si quieres ir "directamente a las características de la reserva puntual"
            if (tipoEv === "PUNTUAL") {
              navigate(`/reservas/puntuales/${id}`); 
              return;
            }

            // Aquí añadirámos la ruta a la consulta periódica, si se realiza la ventana
          }}
          headerToolbar={false} // la reemplazamos con toolbar custom
        />

        
      </div>
    </div>
  );
}
