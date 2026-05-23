import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { TIPOS_DIA } from '../utiles/calendarioConfig';
import LeyendaCalendario from '../componentes/LeyendaCalendario';
import ModalCambioTipo from '../componentes/ModalCambioTipo';
import { obtenerCalendarioCurso, modificarTipoDiaCalendario } from '../../api/calendario';

const pluginsCalendario = [multiMonthPlugin, interactionPlugin];
const localesCalendario = [esLocale];

const obtenerFechasEnRango = (startStr, endStr) => {
    let fechas = [];
    let actual = new Date(startStr);
    let fin = new Date(endStr);
    
    while (actual < fin) {
        const diaSemana = actual.getDay();
        
        if (fechas.length > 0 && (diaSemana === 0 || diaSemana === 6) && actual !=fin) {
            actual.setDate(actual.getDate() + 1);
            continue;
        }
        fechas.push(actual.toISOString().split('T')[0]);

        actual.setDate(actual.getDate() + 1);
    }
    return fechas;
};

export default function VistaDetalleCalendario() {
    const { id_curso } = useParams();
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [datosCurso, setDatosCurso] = useState(null);
    const [diasCalendario, setDiasCalendario] = useState({}); 
    const [modalAbierto, setModalAbierto] = useState(false);
    const [diasSeleccionados, setDiasSeleccionados] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarCalendario = async () => {
            try {
                setCargando(true);
                setError(null);
                const datos = await obtenerCalendarioCurso(id_curso);
                setDatosCurso({ 
                    idcurso: id_curso, 
                    fecha_inicio: datos.fecha_inicio, 
                    fecha_fin: datos.fecha_fin
                });
                setDiasCalendario(datos.dias);
            } catch (err) {
                setError("Error al cargar el calendario");
            } finally {
                setCargando(false);
            }
        };

        cargarCalendario();
    }, [id_curso]);

    const cantidadDeMeses = useMemo(() => {
        if (!datosCurso) return 0;
        const inicio = new Date(datosCurso.fecha_inicio);
        const fin = new Date(datosCurso.fecha_fin);
        return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth()) + 1;
    }, [datosCurso]);

    const eventosFullCalendar = useMemo(() => {
        return Object.entries(diasCalendario).map(([fecha, datosDia]) => {
            const infoTipo = TIPOS_DIA[datosDia.tipo];
            return {
                start: fecha,
                allDay: true,
                display: 'background',
                backgroundColor: infoTipo.color,
                classNames: [infoTipo.clase]
            };
        });
    }, [diasCalendario]);

    // const manejarClicDia = (info) => {
    //     setDiasSeleccionado(info.dateStr);
    //     setModalAbierto(true);
    // };
    const manejarSeleccion = (info) => {
        const fechas = obtenerFechasEnRango(info.startStr, info.endStr);

        if (fechas.length == 0) {
            return;
        }

        setDiasSeleccionados(fechas);
        setModalAbierto(true);
    };


    // const manejarGuardarDia = async (nuevosDatosDia) => {
    //     setDiasCalendario(prev => {
    //         const copia = { ...prev };
    //         copia[diasSeleccionado] = nuevosDatosDia; 
    //         return copia;
    //     });
    //     setModalAbierto(false);

    //     try {
    //         setError(null);
    //         const payload = {
    //             fecha: diasSeleccionado,
    //             ...nuevosDatosDia
    //         };
            
    //         await modificarTipoDiaCalendario(payload);
            
    //     } catch (err) {
    //         setError(`No se pudo modificar el día ${diasSeleccionado}.`);
    //     }
    // };

    const manejarGuardarDias = async (nuevosDatosDia) => {
        setDiasCalendario(prev => {
            const copia = { ...prev };
            diasSeleccionados.forEach(dia => {
                copia[dia] = nuevosDatosDia; 
            });
            return copia;
        });
        setModalAbierto(false);

        try {
            setError(null);
            const payload = { 
                fechas: diasSeleccionados,
                ...nuevosDatosDia 
            };
            await modificarTipoDiaCalendario(payload);
            
        } catch (err) {
            setError(`Error al modificar algunos días de la selección.`);
        }
    };

    const obtenerDatosDia = (fechaStr) => {
        if (diasCalendario[fechaStr]) {
            return diasCalendario[fechaStr];
        }
        
        const eventoDia = eventosFullCalendar.find(e => e.start === fechaStr);
        if (eventoDia) {
            const tipoEncontrado = Object.values(TIPOS_DIA).find(t => t.color === eventoDia.backgroundColor);
            if (tipoEncontrado) {
                return { tipo: tipoEncontrado.id };
            }
        }
        
        return { tipo: 'NO_LECTIVO' };
    }

    const rangoValido = useMemo(() => {
        if (!datosCurso) return undefined;
        return {
            start: datosCurso.fecha_inicio,
            end: new Date(new Date(datosCurso.fecha_fin).getTime() + 86400000).toISOString().split('T')[0] 
        };
    }, [datosCurso]);

    const configuracionVistas = useMemo(() => {
        return {
            customMultiMonth: {
                type: 'multiMonth',
                duration: { months: cantidadDeMeses },
                multiMonthMaxColumns: 3,
                showNonCurrentDates: false
            }
        };
    }, [cantidadDeMeses]);

    if (cargando) return <div className="p-10 text-center text-slate-500">Cargando calendario...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 relative">
            <style>{`
                .calendario-interactivo .fc { font-size: 0.85rem; }
                .calendario-interactivo .fc .fc-multimonth-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; padding: 0.5em 0; text-transform: capitalize; }
                .calendario-interactivo .fc .fc-daygrid-day-frame {  display: flex; align-items: center; justify-content: center; }
                .calendario-interactivo .fc .fc-daygrid-day-top { display: flex; justify-content: center; width: 100%; }
                .calendario-interactivo .fc-daygrid-day:hover { cursor: pointer !important; opacity: 0.8; transition: opacity 0.2s; }
                .calendario-interactivo .fc-bg-event { opacity: 1 !important; }
                .calendario-interactivo .fc-daygrid-day:has(.texto-blanco) .fc-daygrid-day-number { color: white !important; font-weight: bold; position: relative; z-index: 10; }
                .calendario-interactivo .fc-daygrid-day:has(.texto-oscuro) .fc-daygrid-day-number { color: #1e293b !important; font-weight: bold; position: relative; z-index: 10; }
            `}</style>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex justify-between items-center animate-fade-in">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="mb-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-800">Calendario Académico {id_curso}</h1>
                    <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded-md hover:bg-slate-50">
                        ← Volver a Cursos
                    </button>
                </div>
                <LeyendaCalendario /> 
            </div>

            <div className="calendario-interactivo bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <FullCalendar
                    plugins={pluginsCalendario}
                    locales={localesCalendario}
                    locale="es"
                    initialView="customMultiMonth"
                    initialDate={datosCurso.fecha_inicio}
                    //dateClick={manejarGuardarDias}
                    events={eventosFullCalendar}
                    validRange={rangoValido}
                    views={configuracionVistas}
                    headerToolbar={false}
                    selectable={true}
                    select={manejarSeleccion}
                />
            </div>

            {modalAbierto && (
                <ModalCambioTipo
                    key={diasSeleccionados[0]}
                    diasSeleccionados={diasSeleccionados}
                    datosActuales={obtenerDatosDia(diasSeleccionados[0])}
                    alCerrar={() => setModalAbierto(false)}
                    alGuardar={manejarGuardarDias}
                />
            )}
        </div>
    );
}