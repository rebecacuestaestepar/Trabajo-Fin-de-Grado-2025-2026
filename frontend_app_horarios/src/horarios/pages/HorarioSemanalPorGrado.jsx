import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerSemestresPorGrado, obtenerAsignaturasPorGradoYSemestre } from '../../api/docencia';
import { obtenerColorGrupo } from '../utiles/coloresGrupo';
import SelectorSemestre from '../componentes/SelectorSemestre';
import CalendarioSemanal from '../componentes/HorarioSemanal';
import BotonVolver from '../../reservas/formulario-componentes/ui/BotonVolver';

export default function VistaHorarioSemanalGrado() {
    const { id_curso, id_grado } = useParams();
    const navigate = useNavigate();

    const [semestres, setSemestres] = useState([]);
    const [semestreActivo, setSemestreActivo] = useState("");
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarSemestres = async () => {
            try {
                const data = await obtenerSemestresPorGrado(id_grado);
                const listaSemestres = data.semestres ? data.semestres : data;
                setSemestres(listaSemestres);
                if (listaSemestres.length > 0) {
                    setSemestreActivo(listaSemestres[0]);
                }
            } catch (error) {
                console.error("Error al cargar semestres:", error);
            }
        };
        cargarSemestres();
    }, [id_grado]);

    useEffect(() => {
        if (!semestreActivo) return;

        const cargarHorario = async () => {
            setCargando(true);
            try {
                const reservas = await obtenerAsignaturasPorGradoYSemestre(id_grado, semestreActivo, id_curso);
                
                const eventosFormateados = reservas.map(res => {
                    const estilo = obtenerColorGrupo(res.grupo);
                    return {
                        id: res.id_reserva,
                        startTime: res.hora_inicio, 
                        endTime: res.hora_fin,
                        daysOfWeek: [res.dia_semana],
                        backgroundColor: estilo.color,
                        borderColor: '#94a3b8',
                        textColor: estilo.texto,
                        extendedProps: {
                            asignatura: res.asignatura,
                            aula: res.aula,
                            grupo: res.grupo,
                            distint: res.distint,
                            tipo: estilo.tipo
                        }
                    };
                });

                console.log("Eventos formateados para el calendario:", eventosFormateados);

                setEventos(eventosFormateados);
            } catch (error) {
                console.error("Error al cargar las asignaturas:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarHorario();
    }, [id_grado, semestreActivo, id_curso]);

    const manejarMovimientoEvento = (info) => {
        const { event, revert } = info;
        
        const distint = event.extendedProps.distint;
        const nuevoDiaSemana = event.start.getUTCDay();
        const nuevaHoraInicio = event.start.toISOString().substring(11, 19);
        const nuevaHoraFin = event.end.toISOString().substring(11, 19);

        console.log("Intentando mover serie:", distint);
        console.log("Al día:", nuevoDiaSemana, "Hora:", nuevaHoraInicio, "-", nuevaHoraFin);

        revert(); 
    };

    const manejarClickEvento = (info) => {
        const idReserva = info.event.id;
        if (idReserva) {
            // Ajusta esta ruta a como la tengas en tu App.js o main.jsx
            navigate(`/reservas/periodicas/ver/${idReserva}`); 
        } else {
            console.warn("Este evento no tiene un ID de reserva asociado.");
        }
    };

    const irACrearReserva = () => {
        navigate('/reservas/periodicas/crear', { 
            state: { 
                grado: id_grado, 
                semestre: semestreActivo 
            } 
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <BotonVolver fallback={`/horarios/${id_curso}/grados`} />
                
                <button
                    onClick={irACrearReserva}
                    className="inline-flex items-center justify-center rounded-md bg-[#7a1e1e] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#631818] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e] focus:ring-offset-2"
                >
                    Crear Reserva Periódica
                </button>
            </div>
            
            <SelectorSemestre 
                idCurso={id_curso}
                idGrado={id_grado}
                semestres={semestres}
                semestreActivo={semestreActivo}
                onSeleccionarSemestre={setSemestreActivo}
                cargando={cargando}
            />

            <CalendarioSemanal 
                eventos={eventos}
                cargando={cargando}
                onEventoSoltado={manejarMovimientoEvento}
                onEventoClick={manejarClickEvento}
            />
        </div>
    );
}