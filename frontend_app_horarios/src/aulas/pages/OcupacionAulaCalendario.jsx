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
import es from "@fullcalendar/core/locales/es";


export default function OcupacionAulaCalendario() {
  const navigate = useNavigate();
  const location = useLocation();
  const calRef = useRef(null);

  const [searchParams] = useSearchParams();
  const aulasSeleccionadasNombres = searchParams.getAll("aula");

  const objetosAulas = location.state?.aulasSeleccionadas || []; 


  const [tipo, setTipo] = useState("AMBAS"); 

  const [calendarioTitulo, setCalendarioTitulo] = useState("");
  const [calendarioView, setCalendarioView] = useState("timeGridWeek");

  const { events, setRange } = useEventosAula({ aulasNombres: aulasSeleccionadasNombres, tipo });

  console.log("Eventos obtenidos:", events);


  const mapaColores = useMemo(() => {
    return generarMapaColores(objetosAulas);
  }, [objetosAulas]);

  const handleDateClick = (arg) => {
    const calendarApi = calRef.current.getApi();
    calendarApi.changeView('timeGridDay', arg.date);
  };

  return (
    <div className="space-y-3">
      <BotonVolver fallback="/ocupacion-aulas" />
    
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">
            Ocupación de: {aulasSeleccionadasNombres.join(", ") || "Ninguna aula seleccionada"}
          </div>
        </div>
      </div>

        <div className="mt-3">
          <ToolbarAulaCalendar
            title={calendarioTitulo}
            onPrev={() => calRef.current?.getApi?.().prev()}
            onNext={() => calRef.current?.getApi?.().next()}
            onToday={() => calRef.current?.getApi?.().today()}
            onView={(v) => calRef.current?.getApi?.().changeView(v)}
            view={calendarioView}
            tipo={tipo}
            setTipo={setTipo}
          />
        </div>

        <div className="mt-3">
          <LeyendaAulas mapaColores={mapaColores} />
        </div>


      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"          
          firstDay={1}                        
          nowIndicator={true}
          height="75vh"
          expandRows={true}
          events={events}
          locale={es}

          timeZone="UTC"

          navLinks={true} 
          dateClick={handleDateClick}

          eventDidMount={(arg) => {
            const tipoEv = arg.event.extendedProps?.tipo;
            const aulaEv = arg.event.extendedProps?.aula;

            const coloresAula = mapaColores[aulaEv] || { oscuro: "#475569", claro: "#cbd5e1" };
            
            const bgColor = tipoEv === "PUNTUAL" ? coloresAula.oscuro : coloresAula.claro;

            arg.el.style.backgroundColor = bgColor;
            arg.el.style.borderColor = bgColor;
            arg.el.style.color = tipoEv === "PERIODICA" ? "#1e293b" : "#ffffff";
          }}
          datesSet={(arg) => {
            setCalendarioTitulo(arg.view.title);
            setCalendarioView(arg.view.type);

            setRange((prev) => {
              if (!prev) return { start: arg.start, end: arg.end };
              
              if (
                prev.start.getTime() === arg.start.getTime() &&
                prev.end.getTime() === arg.end.getTime()
              ) {
                return prev; 
              }
              
              return { start: arg.start, end: arg.end };
            });
          }}
          eventClick={(info) => {
            const tipoEv = info.event.extendedProps?.tipo;
            const id = info.event.id;

            if (tipoEv === "PUNTUAL") {
              navigate(`/reservas/puntuales/${id}`); 
              return;
            }

          }}
          headerToolbar={false} 
        />

        
      </div>
    </div>
  );
}
