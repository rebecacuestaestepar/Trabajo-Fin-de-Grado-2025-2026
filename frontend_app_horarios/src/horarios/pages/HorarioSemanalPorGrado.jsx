import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { obtenerSemestresPorGrado, obtenerAsignaturasPorGradoYSemestre, obtenerGradosPorCurso, validarRestricciones, moverReservaPeriodica } from '../../api/docencia';
import { obtenerColorGrupo } from '../utiles/coloresGrupo';
import SelectorSemestre from '../componentes/SelectorSemestre';
import CalendarioSemanal from '../componentes/HorarioSemanal';
import BotonVolver from '../../reservas/formulario-componentes/ui/BotonVolver';
import ModalRestricciones from '../componentes/ModalRestricciones';

import RequierePermiso from "../../auth/RequierePermiso";

export default function VistaHorarioSemanalGrado() {
    const { id_curso } = useParams();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const [grados, setGrados] = useState([]);
    
    const gradoActivo = searchParams.get("grado") || "";
    const semestreActivo = searchParams.get("semestre") || "";

    const [semestres, setSemestres] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [motivosAlerta, setMotivosAlerta] = useState([]);
    const [movimientoPendiente, setMovimientoPendiente] = useState(null);

    const [recarga, setRecarga] = useState(0);

    const permisos = JSON.stringify(sessionStorage.getItem("permisos") || "[]");

    const puedoEditar = permisos.includes("change_reservaperiodica");
    const puedoVer = permisos.includes("view_reservaperiodica");

    useEffect(() => {
        let montado = true;
        const cargarGrados = async () => {
            setCargando(true);
            try {
                const data = await obtenerGradosPorCurso(id_curso);
                if (!montado) return;
                setGrados(data);
                setSearchParams(prev => {
                    if (data.length > 0 && !prev.get("grado")) {
                        prev.set("grado", data[0].idgrado);
                        return prev;
                    }
                    return prev;
                }, { replace: true });
            } catch (error) {
                console.error("Error al cargar grados:", error);
            } finally {
                if (montado) {
                    setCargando(false);
                }
            }
        };
        cargarGrados();
        return () => { montado = false; };
    }, [id_curso, searchParams, setSearchParams]);

    useEffect(() => {
        if (!gradoActivo) {
            setSemestres([]);
            setEventos([]);
            return;
        }
        let montado = true;

        const cargarSemestres = async () => {
            setCargando(true);
            try {
                const data = await obtenerSemestresPorGrado(gradoActivo);
                if (!montado) return;
                const listaSemestres = data.semestres ? data.semestres : data;
                setSemestres(listaSemestres);
                
                setSearchParams(prev => {
                    const currentSem = prev.get("semestre");
                    const semestresString = listaSemestres.map(String);
                    
                    if (semestresString.length > 0) {
                        // Si el semestre actual no es válido para este grado, forzamos el primero
                        if (!semestresString.includes(String(currentSem))) {
                            prev.set("semestre", semestresString[0]);
                            return prev;
                        }
                    } else {
                        // Si no hay semestres, lo limpiamos de la URL
                        prev.delete("semestre");
                        return prev;
                    }
                    return prev;
                }, { replace: true });
            } catch (error) {
                console.error("Error al cargar semestres:", error);
            } finally {
                if (montado) {
                    setCargando(false);
                }
            }
        };
        cargarSemestres();
        return () => { montado = false; };
    }, [gradoActivo]);

    useEffect(() => {
        if (!gradoActivo || !semestreActivo) {
            setEventos([]);
            return;
        }

        let montado = true;
        const cargarHorario = async () => {
            setCargando(true);
            try {
                const reservas = await obtenerAsignaturasPorGradoYSemestre(gradoActivo, semestreActivo, id_curso);
                if (!montado) return;

                const eventosFormateados = reservas.map(res => {
                    const estilo = obtenerColorGrupo(String(res.grupo_nombre));
                    return {
                        id: res.id_reserva,
                        startTime: res.hora_inicio, 
                        endTime: res.hora_fin,
                        daysOfWeek: [res.dia_semana],
                        backgroundColor: estilo.color,
                        borderColor: '#94a3b8',
                        textColor: estilo.texto,
                        extendedProps: {
                            asignatura: res.asignatura_abreviatura || res.asignatura_nombre,
                            nombreCompleto: res.asignatura_nombre,
                            aula: res.aula_nombre,
                            grupo: res.grupo_nombre,
                            distint: res.distint,
                            tipo: estilo.tipo
                        }
                    };
                });
                setEventos(eventosFormateados);
            } catch (error) {
                console.error("Error al cargar las asignaturas:", error);
                if (montado) {
                    setEventos([]);
                }
            } finally {
                if (montado) {
                    setCargando(false);
                }
            }
        };

        cargarHorario();
    }, [gradoActivo, semestreActivo, id_curso, recarga]);

    const manejarCambioGrado = (nuevoGrado) => {
        setSearchParams(prev => {
            prev.set("grado", nuevoGrado);
            prev.delete("semestre"); // Al cambiar grado, borramos semestre para que el efecto asigne el correcto
            return prev;
        });
    };

    const manejarCambioSemestre = (nuevoSemestre) => {
        setSearchParams(prev => {
            prev.set("semestre", nuevoSemestre);
            return prev;
        });
    };

    const manejarMovimientoEvento = async (info) => {
        const { event, revert } = info;
        
        const payloadMovimiento = {
            firma_serie: event.extendedProps.distint,
            nuevo_dia: event.start.getUTCDay(),
            nueva_hora_inicio: event.start.toISOString().substring(11, 19),
            nueva_hora_fin: event.end.toISOString().substring(11, 19),
            forzar: false
        };

        try {
            const data = await validarRestricciones(id_curso, semestreActivo, gradoActivo, payloadMovimiento);

            if (data.valido) {
                ejecutarMovimientoReal(payloadMovimiento);
            } else {
                setMotivosAlerta(data.motivos);
                setMovimientoPendiente({ payload: payloadMovimiento, revertFunc: revert });
                setModalConfirmacion(true);
            }
        } catch (err) {
            console.error("Error al validar:", err);
            revert();
        }
    };

    const ejecutarMovimientoReal = async (payload) => {
        try {
            await moverReservaPeriodica(id_curso, semestreActivo, payload);
            
            setRecarga(prev => prev + 1);
        } catch (error) {
            console.error("Error al mover:", error);
        }
    };

    const cancelarMovimiento = () => {
        if (movimientoPendiente) {
            movimientoPendiente.revertFunc();
        }
        setModalConfirmacion(false);
        setMovimientoPendiente(null);
    };

    const forzarMovimiento = () => {
        if (movimientoPendiente) {
            const payloadForzado = { ...movimientoPendiente.payload, forzar: true };
            ejecutarMovimientoReal(payloadForzado);
        }
        setModalConfirmacion(false);
        setMovimientoPendiente(null);
    };

    const manejarClickEvento = (info) => {
        const idReserva = info.event.id;
        if (idReserva) {
            if(puedoEditar) {
                navigate(`/reservas/periodicas/editar/${idReserva}`); 
            } else if (puedoVer) {
            navigate(`/reservas/periodicas/ver/${idReserva}`);
            }
        } else {
            console.warn("Este evento no tiene un ID de reserva asociado.");
        }
    };

    const irACrearReserva = () => {
        navigate('/reservas/periodicas/crear', { 
            state: { 
                grado: gradoActivo, 
                semestre: semestreActivo ,
                cursoAcademico: id_curso
            } 
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <BotonVolver fallback={`/horarios/cargar/cursos`} />
                
                <RequierePermiso permisos={["add_reservaperiodica"]}>
                    <button
                        onClick={irACrearReserva}
                        disabled={!gradoActivo || !semestreActivo}
                        className="inline-flex items-center justify-center rounded-md bg-[#7a1e1e] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#631818] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e] focus:ring-offset-2"
                    >
                        Crear Reserva Periódica
                    </button>
                </RequierePermiso>
            </div>
            
            <SelectorSemestre 
                idCurso={id_curso}
                grados={grados}
                gradoActivo={gradoActivo}
                onSeleccionarGrado={manejarCambioGrado}
                semestres={semestres}
                semestreActivo={semestreActivo}
                onSeleccionarSemestre={manejarCambioSemestre}
                cargando={cargando}
            />

            {(!gradoActivo || !semestreActivo) && !cargando ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500">
                    Selecciona un grado y un semestre para ver su horario.
                </div>
            ) : (
                <CalendarioSemanal 
                    eventos={eventos}
                    cargando={cargando}
                    onEventoSoltado={manejarMovimientoEvento}
                    onEventoClick={manejarClickEvento}
                />
            )}

            <ModalRestricciones
                abierto={modalConfirmacion}
                motivos={motivosAlerta}
                onCancelar={cancelarMovimiento}
                onContinuar={forzarMovimiento}
            />
        </div>
    );
}