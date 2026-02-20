import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import TarjetaPagina from "../formulario-componentes/ui/TarjetaPagina";
import { ModalConfirmacion } from "../formulario-componentes/ui/ModalConfirmacion";
import { CajaExito, CajaError } from "../formulario-componentes/ui/CajaExito";
import BotonVolver from "../formulario-componentes/ui/BotonVolver";

import CamposBaseReserva from "../formulario-componentes/secciones/CamposBaseReserva";
import SeccionRecursos from "../formulario-componentes/secciones/SeccionChecks";
import SeccionSelectorAula from "../formulario-componentes/secciones/SelectorAula";
import AccionesReserva from "../formulario-componentes/secciones/AccionesReserva";
import SeccionPeriodicidad from "../formulario-componentes/secciones/SeccionPeriodicidad";

import { useReservaPuntual } from "../formulario-hooks/useReservaPuntual";

export default function CrearReserva() {
  // Reutilizas el mismo hook si te vale el flujo.
  // Si luego quieres separar lógica admin/solicitud, lo hacemos en otro paso.
  const reserva = useReservaPuntual();
  
  // Para “no ponerla por defecto en Pendiente”:
  // dejamos el estado vacío al entrar (para forzar al usuario a elegir).
  // Si prefieres un valor por defecto distinto, cámbialo aquí.
  useEffect(() => {
    if (reserva.formulario.estado === undefined) {
      reserva.aplicarCambios({ estado: "" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ModalConfirmacion
        abierto={reserva.modal.openConfirm}
        titulo={`¿Seguro que quieres generar ${reserva.modal.confirmCount} reserva(s)?`}
        descripcion={reserva.modal.descripcionConfirm}
        alCancelar={() => reserva.modal.setOpenConfirm(false)}
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
            // aquí NO bloqueamos estado, queremos que se pueda editar:
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

          {/* Variante distinta si quieres que el botón diga "Crear" */}
          <AccionesReserva variante="crear" deshabilitado={!reserva.puedeEnviar} />

          <CajaExito>{reserva.mensaje}</CajaExito>
          <CajaError errores={reserva.errores} />
        </form>
      </TarjetaPagina>
    </div>
  );
}
