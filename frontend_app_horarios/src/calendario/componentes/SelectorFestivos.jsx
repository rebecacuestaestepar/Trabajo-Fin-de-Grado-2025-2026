import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import PropTypes from 'prop-types';

const pluginsCalendario = [multiMonthPlugin, interactionPlugin];
const localesCalendario = [esLocale];

SelectorFestivos.propTypes = {
    fechaInicio: PropTypes.string,
    fechaFin: PropTypes.string,
    festivos: PropTypes.arrayOf(PropTypes.string),
    setFestivos: PropTypes.func
};

export default function SelectorFestivos({ fechaInicio, fechaFin, festivos, setFestivos }) {
    const [expandido, setExpandido] = useState(false);
    
    const cambioCheck = () => {
        if (!expandido) {
            setFestivos([]);
        }
    }

    const cantidadDeMeses = useMemo(() => {
        if (!fechaInicio || !fechaFin) return 0;
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth()) + 1;
    }, [fechaInicio, fechaFin]);

    const diasFestivos = useMemo(() => {
        return festivos.map(fecha => ({
            start: fecha,
            allDay: true,
            display: 'background',
            backgroundColor: '#7a1e1e',
            borderColor: '#7a1e1e',
        }));
    }, [festivos]);

    const rangoValido = useMemo(() => {
        if (!fechaInicio || !fechaFin) return undefined;
        return {
            start: fechaInicio,
            end: new Date(new Date(fechaFin).getTime() + 86400000).toISOString().split('T')[0] 
        };
    }, [fechaInicio, fechaFin]);

    const configuracionVistas = useMemo(() => {
        return {
            customMultiMonth: {
                type: 'multiMonth',
                duration: { months: cantidadDeMeses },
                multiMonthMaxColumns: 3
            }
        };
    }, [cantidadDeMeses]);

    const manejarClicDia = (info) => {
        const fechaClicada = info.dateStr; 
        
        if (festivos.includes(fechaClicada)) {
            setFestivos(prev => prev.filter(f => f !== fechaClicada));
        } else {
            setFestivos(prev => [...prev, fechaClicada]);
        }
    };

    return (
        <div className="border border-slate-200 rounded-md bg-slate-50/50">
            <style>{`
                .calendario-festivos-wrapper .fc {
                    font-size: 0.8rem;
                }
                
                .calendario-festivos-wrapper .fc .fc-multimonth-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    padding: 0.4em 0;
                    color: #1e293b;
                    text-transform: capitalize;
                }

                .calendario-festivos-wrapper .fc .fc-daygrid-day-frame {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .calendario-festivos-wrapper .fc .fc-daygrid-day-top {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .calendario-festivos-wrapper .fc-daygrid-day:hover {
                    cursor: pointer !important;
                    background-color: #651818 !important;
                    transition: background-color 0.2s;
                    color: white !important;
                }

                .calendario-festivos-wrapper .fc-daygrid-day:has(.fc-bg-event) .fc-daygrid-day-number {
                    color: white !important;
                    position: relative; 
                    z-index: 10;
                    font-weight: bold;
                }

                .calendario-festivos-wrapper .fc-bg-event {
                    opacity: 0.85 !important;
                }
            `}</style>
            <label className="flex items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#7a1e1e] border-gray-300 rounded focus:ring-[#7a1e1e]"
                    checked={expandido}
                    onChange={(e) => {
                        setExpandido(e.target.checked);
                        cambioCheck();
                    }}
                />
                <span className="ml-3 text-sm font-bold text-[#1E293B]">
                    Añadir días festivos en el calendario
                </span>
            </label>

            {expandido && (
                <div className="p-4 border-t border-slate-200 bg-white">
                    {cantidadDeMeses <= 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-4">
                            Por favor, selecciona las fechas de inicio y fin del curso primero.
                        </p>
                    ) : (
                        <div className="calendario-festivos-wrapper">
                            <FullCalendar
                                plugins={pluginsCalendario}
                                initialView="customMultiMonth"
                                locales={localesCalendario}
                                locale="es"
                                initialDate={fechaInicio} 
                                dateClick={manejarClicDia}
                                events={diasFestivos}
                                
                                validRange={rangoValido}

                                views={configuracionVistas}

                                headerToolbar={false}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}