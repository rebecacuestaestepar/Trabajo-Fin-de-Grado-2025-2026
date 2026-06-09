import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { reservaDesdeHorarioGrado } from '../../../api/docencia'; // Asegúrate de que esta ruta es correcta

import TarjetaPagina from '../../formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../formulario-componentes/ui/BotonVolver';
import { CajaExito, CajaError } from '../../formulario-componentes/ui/CajaExito';

import SeccionDocencia from '../componentes/SeccionDocencia';
import SeccionHorario from '../componentes/SeccionHorario';
import SeccionSelectorAula from '../../formulario-componentes/secciones/SelectorAula';
import AccionesReserva from '../../formulario-componentes/secciones/AccionesReserva';

import { useReservaPeriodica } from '../hooks/useReservaPeriodica';


export default function CrearReservaPeriodica() {
    const location = useLocation();
    
    const gradoState = location.state?.grado ? Number(location.state.grado) : '';
    const semestreState = location.state?.semestre ? Number(location.state.semestre) : '';

    const cursoAcademicoState = location.state?.cursoAcademico ? String(location.state.cursoAcademico) : '';

    const requiereCalcularCurso = Boolean(gradoState && semestreState);
    const [cargando, setCargando] = useState(requiereCalcularCurso);
    
    const [datosIniciales, setDatosIniciales] = useState({
        grado: gradoState,
        curso_academico: cursoAcademicoState,
        curso: '',
        semestre: semestreState
    });



    useEffect(() => {
        if (requiereCalcularCurso) {
            reservaDesdeHorarioGrado(gradoState, semestreState)
                .then(data => {
                    setDatosIniciales({
                        grado: gradoState,
                        curso: data.curso ? Number(data.curso) : '',
                        curso_academico: cursoAcademicoState,
                        semestre: semestreState
                    });
                })
                .catch(err => {
                    console.error("Error calculando el curso:", err);
                })
                .finally(() => {
                    setCargando(false);
                });
        }
    }, [gradoState, semestreState, cursoAcademicoState, requiereCalcularCurso]);

    if (cargando) return <div className="p-6 text-slate-500">Calculando datos académicos...</div>;

    return <FormularioCrear datos={datosIniciales} />;
}


function FormularioCrear({ datos }) {
    const reserva = useReservaPeriodica({
        modo: 'crear',
        datosIniciales: datos
    });

    return (
        <div>
            <TarjetaPagina 
                titulo="CREAR RESERVA PERIÓDICA"
                izquierda={<BotonVolver/>}
                derecha={<span />}
            >
                <form onSubmit={reserva.enviarFormulario} className="space-y-6">
                    
                    <SeccionDocencia 
                        formulario={reserva.formulario}
                        listas={reserva.listas}
                        alCambiar={reserva.aplicarCambios}
                        soloLectura={reserva.esModoVer}
                    />

                    <SeccionHorario 
                        formulario={reserva.formulario}
                        alCambiar={reserva.aplicarCambios}
                        soloLectura={reserva.esModoVer}
                    />

                    <SeccionSelectorAula 
                        titulo="Aula candidata"
                        alBuscarAulas={reserva.buscarAulas}
                        estaBuscando={reserva.buscandoAulas}
                        puedeBuscar={reserva.puedeBuscarAulas}
                        modo={reserva.modoSeleccionAula}
                        aulasDisponibles={reserva.aulasDisponibles}
                        aulaSeleccionada={reserva.aulaSeleccionada}
                        alSeleccionarAula={reserva.setAulaSeleccionada}
                        fechas={[]}
                        aulasPorFecha={{}}
                        seleccionPorFecha={{}}
                        alSeleccionarPorFecha={() => {}}
                    />

                    <AccionesReserva 
                        variante="crear" 
                        deshabilitado={!reserva.puedeEnviar} 
                        alGuardar={reserva.enviarFormulario} 
                    />

                    <CajaExito>{reserva.exito}</CajaExito>
                    <CajaError errores={reserva.errores} />
                </form>
            </TarjetaPagina>
        </div>
    );
}