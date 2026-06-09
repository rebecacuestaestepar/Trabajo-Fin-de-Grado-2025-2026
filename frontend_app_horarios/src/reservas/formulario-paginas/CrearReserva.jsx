import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TarjetaPagina from "../formulario-componentes/ui/TarjetaPagina";
import { ModalConfirmacion } from "../formulario-componentes/ui/ModalConfirmacion";
import { ModalDatosResponsable } from "../formulario-componentes/ui/ModalDatosResponsable";

import { CajaExito, CajaError } from "../formulario-componentes/ui/CajaExito";
import BotonVolver from "../formulario-componentes/ui/BotonVolver";

import CamposBaseReserva from "../formulario-componentes/secciones/CamposBaseReserva";
import SeccionRecursos from "../formulario-componentes/secciones/SeccionChecks";
import SeccionSelectorAula from "../formulario-componentes/secciones/SelectorAula";
import AccionesReserva from "../formulario-componentes/secciones/AccionesReserva";
import SeccionPeriodicidad from "../formulario-componentes/secciones/SeccionPeriodicidad";

import { useReservaPuntual } from "../formulario-hooks/useReservaPuntual";

export default function CrearReserva() {
  const navigate = useNavigate();
  const reserva = useReservaPuntual({ esCreacion: true, onFinish: () => navigate("/reservas/gestion") });
  
  useEffect(() => {
    if (reserva.formulario.estado === undefined) {
      reserva.aplicarCambios({ estado: "" });
    }
  }, [reserva]);

  return (
    <div>
      <ModalConfirmacion
        abierto={reserva.modal.openConfirm}
        titulo={`¿Seguro que quieres generar ${reserva.modal.confirmCount} reserva(s)?`}
        descripcion={reserva.modal.descripcionConfirm}
        alCancelar={() => reserva.modal.setOpenConfirm(false)}
        alConfirmar={reserva.modal.onConfirm}
      />

      <ModalDatosResponsable
        abierto={reserva.modal.openResponsable}
        correo={reserva.formulario.correo_responsable}
        formulario={reserva.formulario}
        alCambiar={reserva.aplicarCambios}
        alCancelar={() => reserva.modal.setOpenResponsable(false)}
        alConfirmar={reserva.modal.onConfirm}
      />

      <TarjetaPagina titulo="CREAR RESERVA"
        izquierda={<BotonVolver fallback="/reservas/todas" />}
        derecha={<span />}
      >
        
        <form onSubmit={reserva.enviarFormulario} className="space-y-6">
          <CamposBaseReserva
            formulario={reserva.formulario}
            alCambiar={reserva.aplicarCambios}
            mostrarEstado
            soloLectura={{}}
          />

          <SeccionRecursos
            formulario={reserva.formulario}
            alCambiar={reserva.aplicarCambios}
          />

          <SeccionPeriodicidad
            formulario={reserva.formulario}
            alCambiar={reserva.aplicarCambios}
          />

          <SeccionSelectorAula
            alBuscarAulas={reserva.buscarAulas}
            estaBuscando={reserva.buscando}
            puedeBuscar={reserva.puedeBuscarAulas}
            modo={reserva.modoSeleccionAula}
            aulasDisponibles={reserva.aulasDisponibles}
            aulaSeleccionada={reserva.aulaSeleccionada}
            alSeleccionarAula={reserva.setAulaSeleccionada}
            fechas={reserva.fechasPeriodicas}
            aulasPorFecha={reserva.aulasPorFecha}
            seleccionPorFecha={reserva.seleccionPorFecha}
            alSeleccionarPorFecha={(f, v) =>
              reserva.setSeleccionPorFecha((prev) => ({ ...prev, [f]: v }))
            }
            permitirManualSiVacio={false}
          />

          <AccionesReserva variante="crear" deshabilitado={!reserva.puedeEnviar} alGuardar={reserva.enviarFormulario} />

          <CajaExito>{reserva.mensaje}</CajaExito>
          <CajaError errores={reserva.errores} />
        </form>
      </TarjetaPagina>
    </div>
  );
}
