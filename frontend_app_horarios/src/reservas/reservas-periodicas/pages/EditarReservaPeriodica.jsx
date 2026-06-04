import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerDatosReservaPeriodica } from '../../../api/docencia';

import TarjetaPagina from '../../formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../formulario-componentes/ui/BotonVolver';
import { CajaExito, CajaError } from '../../formulario-componentes/ui/CajaExito';

import SeccionDocencia from '../componentes/SeccionDocencia';
import SeccionHorario from '../componentes/SeccionHorario';
import SeccionSelectorAula from '../../formulario-componentes/secciones/SelectorAula';
import AccionesReserva from '../../formulario-componentes/secciones/AccionesReserva';

import { useReservaPeriodica } from '../hooks/useReservaPeriodica';

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
    
    // El hook ahora recibe los datos reales desde el primer renderizado
    const reserva = useReservaPeriodica({
        modo: 'editar',
        datosIniciales: datos
    });

    const manejarGuardarEdicion = (e) => {
        e.preventDefault();
        console.log("Enviando cambios (PUT) de la reserva ", id, reserva.formulario);
    };

    return (
        <div>
            <TarjetaPagina 
                titulo="EDITAR RESERVA PERIÓDICA"
                izquierda={<BotonVolver />}
                derecha={<span />}
            >
                <form onSubmit={manejarGuardarEdicion} className="space-y-6">
                    
                    <SeccionDocencia
                        formulario={reserva.formulario}
                        listas={reserva.listas}
                        alCambiar={reserva.aplicarCambios}
                        soloLectura={false}
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
                    />

                    <CajaExito>{reserva.exito}</CajaExito>
                    <CajaError errores={reserva.errores} />
                </form>
            </TarjetaPagina>
        </div>
    );
}