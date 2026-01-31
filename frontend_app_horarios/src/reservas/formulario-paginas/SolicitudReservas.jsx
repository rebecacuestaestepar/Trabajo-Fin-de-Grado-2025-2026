import TarjetaPagina from "../formulario-componentes/ui/TarjetaPagina";
import { ModalConfirmacion } from "../formulario-componentes/ui/ModalConfirmacion";
import { CajaExito, CajaError } from "../formulario-componentes/ui/CajaExito";

import CamposBaseReserva from "../formulario-componentes/secciones/CamposBaseReserva";
import SeccionRecursos from "../formulario-componentes/secciones/SeccionChecks";
import SeccionSelectorAula from "../formulario-componentes/secciones/SelectorAula";
import AccionesReserva from "../formulario-componentes/secciones/AccionesReserva";

import { Selector, EntradaTexto } from "../formulario-componentes/ui/Inputs";
import { Campo } from "../formulario-componentes/ui/Campo";

import { useReservaPuntual } from "../formulario-hooks/useReservaPuntual";
import { calcularFechasPeriodicas } from "../formulario-utiles/fechasPeriodicas";

export default function SolicitudReservas() {
  const reserva = useReservaPuntual();

  return (
    <div>
      <ModalConfirmacion
        abierto={reserva.modal.openConfirm}
        titulo={`¿Seguro que quieres generar ${reserva.modal.confirmCount} reserva(s)?`}
        descripcion={reserva.modal.descripcionConfirm}
        alCancelar={() => reserva.modal.setOpenConfirm(false)}
        alConfirmar={reserva.modal.onConfirm}
      />

      <TarjetaPagina titulo="SOLICITAR RESERVA PUNTUAL">
        <form onSubmit={reserva.enviarFormulario} className="space-y-6">
          <CamposBaseReserva
            formulario={reserva.formulario}
            alCambiar={reserva.aplicarCambios}
          />

          <SeccionRecursos
            formulario={reserva.formulario}
            alCambiar={reserva.aplicarCambios}
          />

          {/* Periodicidad (solo existe en Solicitud) */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={!!reserva.formulario.generar_periodica}
                  onChange={(e) =>
                    reserva.aplicarCambios({ generar_periodica: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#7a1e1e]"
                />
                Generar reserva de forma periódica
              </label>
              <span className="text-xs text-slate-500">(Opcional)</span>
            </div>

            {reserva.formulario.generar_periodica && (
              <div className="mt-4 space-y-4 rounded-md border border-[#7a1e1e]/20 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Configuración de reserva periódica
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Campo etiqueta="Fecha inicio">
                    <EntradaTexto
                      type="date"
                      value={reserva.formulario.fecha_inicio_periodo}
                      onChange={(e) =>
                        reserva.aplicarCambios({ fecha_inicio_periodo: e.target.value })
                      }
                    />
                  </Campo>

                  <Campo etiqueta="Fecha fin">
                    <EntradaTexto
                      type="date"
                      value={reserva.formulario.fecha_fin_periodo}
                      onChange={(e) =>
                        reserva.aplicarCambios({ fecha_fin_periodo: e.target.value })
                      }
                    />
                  </Campo>
                </div>

                <Campo etiqueta="Día de la semana">
                  <Selector
                    value={reserva.formulario.dia_semana_periodica}
                    onChange={(e) =>
                      reserva.aplicarCambios({ dia_semana_periodica: e.target.value })
                    }
                  >
                    <option value="">Selecciona un día</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                  </Selector>
                </Campo>

                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  Se generarán{" "}
                  <span className="font-semibold text-slate-800">
                    {
                      calcularFechasPeriodicas(
                        reserva.formulario.fecha_inicio_periodo,
                        reserva.formulario.fecha_fin_periodo,
                        reserva.formulario.dia_semana_periodica
                      ).length
                    }
                  </span>{" "}
                  reserva(s) con esta configuración.
                </div>
              </div>
            )}
          </div>

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

          <AccionesReserva variante="solicitud" deshabilitado={!reserva.puedeEnviar} />

          <CajaExito>{reserva.mensaje}</CajaExito>
          <CajaError errores={reserva.errores} />
        </form>
      </TarjetaPagina>
    </div>
  );
}
