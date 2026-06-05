import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDatosReservaPeriodica, eliminarReservaPeriodica } from '../../../api/docencia';

import TarjetaPagina from '../../formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../formulario-componentes/ui/BotonVolver';
import { CajaExito, CajaError } from '../../formulario-componentes/ui/CajaExito';

import SeccionDocencia from '../componentes/SeccionDocencia';
import SeccionHorario from '../componentes/SeccionHorario';
import SeccionSelectorAula from '../../formulario-componentes/secciones/SelectorAula';
import AccionesReserva from '../../formulario-componentes/secciones/AccionesReserva';

import { useReservaPeriodica } from '../hooks/useReservaPeriodica';
import ModalConfirmacion from '../../../shared/modales/ModalConfirmacion';

export default function EditarReservaPeriodica() {
    const { id } = useParams();
    const [datosCargados, setDatosCargados] = useState(null);
    const [errorCarga, setErrorCarga] = useState(null);

    useEffect(() => {
        obtenerDatosReservaPeriodica(id)
            .then(data => {
                const res = data.reserva;
                setDatosCargados({
                    grado: Number(res.grado) || '',
                    curso: Number(res.curso) || '',
                    curso_academico: String(res.curso_academico) || '',
                    semestre: Number(res.semestre) || '',
                    asignatura: Number(res.asignatura) || '',
                    grupo: Number(res.grupo) || '',
                    diaSemana: String(res.dia_semana),
                    horaInicio: res.hora_inicio,
                    horaFin: res.hora_fin,
                    aulaSeleccionada: res.aula
                });
            })
            .catch(() => setErrorCarga("Error al cargar la reserva para edición."));
    }, [id]);

    if (errorCarga) return <div className="p-6"><CajaError errores={{ mensaje: errorCarga }} /></div>;
    if (!datosCargados) return <div className="p-6 text-sm text-slate-500">Cargando reserva...</div>;

    return <FormularioEditar id={id} datos={datosCargados} />;
}

function FormularioEditar({ id, datos }) {

    const navigate = useNavigate();

    const [estadoEliminar, setEstadoEliminar] = useState({ exito: null, error: null });

    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    
    const reserva = useReservaPeriodica({
        modo: 'editar',
        datosIniciales: datos
    });

    const formularioModificado = 
        String(reserva.formulario.asignatura) !== String(datos.asignatura) ||
        String(reserva.formulario.grupo) !== String(datos.grupo) ||
        String(reserva.formulario.diaSemana) !== String(datos.diaSemana) ||
        reserva.formulario.horaInicio !== datos.horaInicio ||
        reserva.formulario.horaFin !== datos.horaFin;

    // La firma original se mantiene constante para identificar la reserva, incluso si el usuario modifica los campos
    const firmaOriginal = `${datos.asignatura}|${datos.grupo}|${datos.diaSemana}|${datos.horaInicio}|${datos.horaFin}|${datos.aulaSeleccionada}`;

    const manejarGuardarEdicion = (e) => {
        e.preventDefault();
        console.log("Enviando cambios (PUT) de la reserva ", id, reserva.formulario);
    };

    const manejarClickEliminar = (e) => {
        e.preventDefault();
        setMostrarModalEliminar(true);
    };

    const confirmarEliminacion = async () => {
        setMostrarModalEliminar(false); // Cerramos la modal
        setEstadoEliminar({ cargando: true, error: null, exito: null });

        const payloadEliminar = {
            curso_academico: datos.curso_academico, 
            semestre_num: datos.semestre,
            firma_serie: firmaOriginal
        };

        console.log("Datos que se envían para eliminar:", payloadEliminar);

        try {
            await eliminarReservaPeriodica(payloadEliminar);
            
            setEstadoEliminar({ cargando: false, error: null, exito: "Serie de reservas eliminada correctamente." });
            
            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (error) {
            setEstadoEliminar({ cargando: false, error: error.message || "Hubo un error al eliminar", exito: null });
        }
    };

    return (
        <div>
            <TarjetaPagina 
                titulo="EDITAR RESERVA PERIÓDICA"
                izquierda={<BotonVolver />}
                derecha={<span />}
            >

                <ModalConfirmacion 
                    isOpen={mostrarModalEliminar}
                    mensaje={`¿Estás seguro de que deseas eliminar TODA la serie de reservas? Esta acción no se puede deshacer y liberará el aula para todo el semestre.`}
                    onConfirm={confirmarEliminacion}
                    onCancel={() => setMostrarModalEliminar(false)}
                />
                <form onSubmit={manejarGuardarEdicion} className="space-y-6">
                    
                    <SeccionDocencia
                        formulario={reserva.formulario}
                        listas={reserva.listas}
                        alCambiar={reserva.aplicarCambios}
                        soloLectura={true}
                    />

                    <SeccionHorario 
                        formulario={reserva.formulario}
                        alCambiar={reserva.aplicarCambios}
                        soloLectura={false}
                    />

                    <SeccionSelectorAula 
                        titulo="Aula candidata"
                        alBuscarAulas={reserva.buscarAulas}
                        estaBuscando={reserva.buscandoAulas}
                        puedeBuscar={reserva.puedeBuscarAulas}
                        modo={reserva.modoSeleccionAula}
                        aulasDisponibles={reserva.aulasDisponibles.length > 0 ? reserva.aulasDisponibles : [{ nombre: datos.aulaSeleccionada }]}
                        aulaSeleccionada={reserva.aulaSeleccionada || datos.aulaSeleccionada}
                        alSeleccionarAula={reserva.setAulaSeleccionada}
                        fechas={[]} 
                        aulasPorFecha={{}} 
                        seleccionPorFecha={{}} 
                        alSeleccionarPorFecha={() => {}}
                    />

                    <AccionesReserva 
                        variante="editar" 
                        deshabilitado={!reserva.puedeEnviar} 
                        alGuardar={manejarGuardarEdicion}
                        alEliminar={manejarClickEliminar}
                        deshabilitarEliminar={formularioModificado || estadoEliminar.cargando}
                    />

                    <CajaExito>{reserva.exito}</CajaExito>
                    <CajaError errores={reserva.errores} />
                </form>
            </TarjetaPagina>
        </div>
    );
}