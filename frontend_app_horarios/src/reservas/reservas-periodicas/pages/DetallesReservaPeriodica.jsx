import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerDatosReservaPeriodica } from '../../../api/docencia';

import TarjetaPagina from '../../formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../formulario-componentes/ui/BotonVolver';
import { CajaError } from '../../formulario-componentes/ui/CajaExito';

import SeccionDocencia from '../componentes/SeccionDocencia';
import SeccionHorario from '../componentes/SeccionHorario';
import SeccionSelectorAula from '../../formulario-componentes/secciones/SelectorAula';

import { useReservaPeriodica } from '../hooks/useReservaPeriodica';


export default function DetallesReservaPeriodica() {
    const { id } = useParams();
    const [datosCargados, setDatosCargados] = useState(null);
    const [errorCarga, setErrorCarga] = useState(null);

    useEffect(() => {
        obtenerDatosReservaPeriodica(id)
            .then(data => {
                console.log("Datos recibidos para la reserva periódica:", data);
                const res = data.reserva || data; 
                setDatosCargados({
                    grado: Number(res.grado), 
                    curso: Number(res.curso), 
                    semestre: Number(res.semestre), 
                    asignatura: Number(res.asignatura), 
                    grupo: Number(res.grupo),
                    diaSemana: String(res.dia_semana),
                    horaInicio: res.hora_inicio,
                    horaFin: res.hora_fin,
                    aulaSeleccionada: res.aula
                });
            })
            .catch(() => setErrorCarga("No se pudo recuperar la información de la reserva."));
    }, [id]);

    if (errorCarga) return <div className="p-6"><CajaError errores={{ mensaje: errorCarga }} /></div>;
    if (!datosCargados) return <div className="p-6 text-sm text-slate-500">Cargando detalles de la reserva...</div>;

    return <FormularioDetalles datos={datosCargados} />;
}

function FormularioDetalles({ datos }) {
    
    const reserva = useReservaPeriodica({
        modo: 'ver',
        datosIniciales: datos
    });

    return (
        <TarjetaPagina 
            titulo="DETALLES DE RESERVA PERIÓDICA"
            izquierda={<BotonVolver fallback="/reservas" />}
            derecha={<span />}
        >
            <div className="space-y-6">
                <SeccionDocencia 
                    formulario={reserva.formulario}
                    listas={reserva.listas}
                    alCambiar={reserva.aplicarCambios}
                    soloLectura={true} 
                />

                <SeccionHorario 
                    formulario={reserva.formulario}
                    alCambiar={reserva.aplicarCambios}
                    soloLectura={true} 
                />

                <SeccionSelectorAula 
                    titulo="Aula Asignada"
                    modo="simple"
                    aulaSeleccionada={datos.aulaSeleccionada}
                    aulasDisponibles={[{ nombre: datos.aulaSeleccionada, capacidad: '-', num_ordenadores: '-' }]}
                    puedeBuscar={false}
                    estaBuscando={false}
                    alBuscarAulas={() => {}}
                    alSeleccionarAula={() => {}}
                />
            </div>
        </TarjetaPagina>
    );
}