import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export default function HorarioSemanal({ eventos, cargando, onEventoSoltado, onEventoClick }) {
    const calendarRef = useRef(null);

    const renderizarContenidoEvento = (eventInfo) => {
        const { asignatura, aula, grupo } = eventInfo.event.extendedProps;
        return (
            <div className="relative flex flex-col h-full p-1 overflow-hidden leading-tight cursor-move">
                <div className="font-bold text-xs truncate">{asignatura}</div>
                <div className="text-[10px] opacity-80 truncate mb-4">{aula}</div>
                {/* <div className="mt-auto self-end font-bold text-[10px] bg-white/50 px-1 rounded border border-black/10"> */}
                <div className="absolute bottom-1 left-1 font-bold text-[9px] bg-white/70 px-1 rounded shadow-sm text-black border border-black/10">
                    G{grupo}
                </div>
            </div>
        );
    };

    const renderizarCabeceraDia = (args) => {
        const dia = args.text;
        return dia.charAt(0).toUpperCase() + dia.slice(1);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
            {cargando && (
                <div className="absolute inset-0 z-20 bg-white/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                    <span className="font-bold text-[#7a1e1e] animate-pulse bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100">
                        Cargando horario...
                    </span>
                </div>
            )}
            
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                hiddenDays={[0, 6]}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="22:00:00"
                expandRows={true}
                height="75vh"
                timeZone="UTC"
                headerToolbar={false}
                events={eventos}
                eventContent={renderizarContenidoEvento}
                editable={true}
                eventDrop={onEventoSoltado}
                locales={esLocale}
                locale={'es'}
                dayHeaderFormat={{ weekday: 'long' }}
                dayHeaderContent={renderizarCabeceraDia}
                eventClick={onEventoClick}
            />
        </div>
    );
}