import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { obtenerDatosReservaPeriodica, eliminarReservaPeriodica, validarEdicionReservaPeriodica, editarReservaPeriodica } from '../../../api/docencia';

import TarjetaPagina from '../../formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../formulario-componentes/ui/BotonVolver';
import { CajaExito, CajaError } from '../../formulario-componentes/ui/CajaExito';

import SeccionDocencia from '../componentes/SeccionDocencia';
import SeccionHorario from '../componentes/SeccionHorario';
import SeccionSelectorAula from '../../formulario-componentes/secciones/SelectorAula';
import AccionesReserva from '../../formulario-componentes/secciones/AccionesReserva';

import { useReservaPeriodica } from '../hooks/useReservaPeriodica';
import ModalConfirmacion from '../../../shared/modales/ModalConfirmacion';
import ModalRestricciones from '../../../horarios/componentes/ModalRestricciones'

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

FormularioEditar.propTypes = {
    id: PropTypes.string.isRequired,
    datos: PropTypes.shape({
        asignatura: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        grupo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        diaSemana: PropTypes.string.isRequired,
        horaInicio: PropTypes.string.isRequired,
        horaFin: PropTypes.string.isRequired,
        aulaSeleccionada: PropTypes.string,
        curso_academico: PropTypes.string.isRequired,
        semestre: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        grado: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        curso: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }).isRequired
};

function FormularioEditar({ id, datos }) {

    const navigate = useNavigate();

    const [estadoAccion, setEstadoAccion] = useState({ cargando: false, exito: null, error: null });

    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [mostrarModalRestricciones, setMostrarModalRestricciones] = useState(false);
    const [motivosRestriccion, setMotivosRestriccion] = useState([]);
    
    const reserva = useReservaPeriodica({
        modo: 'editar',
        datosIniciales: datos
    });

    const horarioModificado = String(reserva.formulario.diaSemana) !== String(datos.diaSemana) ||
        String(reserva.formulario.horaInicio) !== String(datos.horaInicio) ||
        String(reserva.formulario.horaFin) !== String(datos.horaFin);

    const aulaModificada = !!reserva.aulaSeleccionada && reserva.aulaSeleccionada !== datos.aulaSeleccionada;

    const hayCambios = horarioModificado || aulaModificada;

    const puedeGuardar = hayCambios && (!horarioModificado || !!reserva.aulaSeleccionada);


    // La firma original se mantiene constante para identificar la reserva, incluso si el usuario modifica los campos
    const firmaOriginal = `${datos.asignatura}|${datos.grupo}|${datos.diaSemana}|${datos.horaInicio}|${datos.horaFin}|${datos.aulaSeleccionada}`;

    const payloadEdicion = {
        diaSemana: reserva.formulario.diaSemana,
        horaInicio: reserva.formulario.horaInicio,
        horaFin: reserva.formulario.horaFin,
        aulaSeleccionada: horarioModificado 
            ? reserva.aulaSeleccionada 
            : (reserva.aulaSeleccionada || datos.aulaSeleccionada),
    };

    const manejarGuardarEdicion = async (e) => {
        e.preventDefault();
        setEstadoAccion({ cargando: true, exito: null, error: null });

        try {
            // Validamos en el backend
            const respuesta = await validarEdicionReservaPeriodica(id, payloadEdicion);

            console.log("Datos enviados para validación:", payloadEdicion);
            
            if (respuesta.valido) {
                // Si no se violan restricciones, guardamos directamente
                ejecutarGuardado();
            } else {
                // Si se violan restricciones, abrimos la modal y esperamos a que el usuario decida
                setMotivosRestriccion(respuesta.motivos);
                setMostrarModalRestricciones(true);
                setEstadoAccion({ cargando: false, exito: null, error: null });
            }
        } catch (error) {
            setEstadoAccion({ cargando: false, exito: null, error: error.message || "Error al validar la edición" });
        }
    };

    const ejecutarGuardado = async () => {
        setMostrarModalRestricciones(false);
        setEstadoAccion({ cargando: true, exito: null, error: null });

        try {
            // Ejecutamos el cambio real en la base de datos
            await editarReservaPeriodica(id, payloadEdicion);
            
            setEstadoAccion({ cargando: false, error: null, exito: "Reserva modificada correctamente." });
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            setEstadoAccion({ cargando: false, error: error.message || "Error al guardar los cambios", exito: null });
        }
    };

    const manejarClickEliminar = (e) => {
        e.preventDefault();
        setMostrarModalEliminar(true);
    };

    const confirmarEliminacion = async () => {
        setMostrarModalEliminar(false); // Cerramos la modal
        setEstadoAccion({ cargando: true, error: null, exito: null });

        const payloadEliminar = {
            curso_academico: datos.curso_academico, 
            semestre_num: datos.semestre,
            firma_serie: firmaOriginal
        };

        try {
            await eliminarReservaPeriodica(payloadEliminar);
            
            setEstadoAccion({ cargando: false, error: null, exito: "Serie de reservas eliminada correctamente." });
            
            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (error) {
            setEstadoAccion({ cargando: false, error: error.message || "Hubo un error al eliminar", exito: null });
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
                <ModalRestricciones 
                    abierto={mostrarModalRestricciones}
                    motivos={motivosRestriccion}
                    onContinuar={ejecutarGuardado}
                    onCancelar={() => setMostrarModalRestricciones(false)}
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
                        aulasDisponibles={
                            reserva.aulasDisponibles.length > 0 
                                ? reserva.aulasDisponibles 
                                : (horarioModificado ? [] : [{ nombre: datos.aulaSeleccionada }])
                        }
                        aulaSeleccionada={
                            reserva.aulaSeleccionada || (horarioModificado ? "" : datos.aulaSeleccionada)
                        }
                        alSeleccionarAula={reserva.setAulaSeleccionada}
                        fechas={[]} 
                        aulasPorFecha={{}} 
                        seleccionPorFecha={{}} 
                        alSeleccionarPorFecha={() => {}}
                    />

                    <AccionesReserva 
                        variante="editar" 
                        deshabilitarGuardar={!puedeGuardar || estadoAccion.cargando} 
                        alGuardar={manejarGuardarEdicion}
                        alEliminar={manejarClickEliminar}
                        deshabilitarEliminar={hayCambios || estadoAccion.cargando}
                    />

                    <CajaExito>{estadoAccion.exito}</CajaExito>
                    {estadoAccion.error !== null && (
                        <CajaError errores={{ mensaje: estadoAccion.error }} />
                    )}
                </form>
            </TarjetaPagina>
        </div>
    );
}