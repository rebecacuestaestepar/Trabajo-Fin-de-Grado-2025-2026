import { useLocation, useNavigate, useParams } from "react-router-dom";

import TarjetaPagina from "../formulario-componentes/ui/TarjetaPagina";
import { ModalConfirmacion } from "../formulario-componentes/ui/ModalConfirmacion";
import { CajaExito, CajaError } from "../formulario-componentes/ui/CajaExito";

import CamposBaseReserva from "../formulario-componentes/secciones/CamposBaseReserva";
import SeccionChecks from "../formulario-componentes/secciones/SeccionChecks";
import SeccionSelectorAula from "../formulario-componentes/secciones/SelectorAula";
import AccionesReserva from "../formulario-componentes/secciones/AccionesReserva";

import { useEditarReserva } from "../formulario-hooks/useEditarReserva";

export default function EditarReservas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/reservas/pendientes";

  const editar = useEditarReserva(id, {
    onFinish: () => navigate(from),
  });

  if (editar.cargando) return <div className="p-6">Cargando reserva...</div>;
  if (editar.errorCarga) return <div className="p-6 text-rose-700">{editar.errorCarga}</div>;

  return (
    <div>
      <ModalConfirmacion
        abierto={editar.modal.abierto}
        titulo={editar.modal.titulo}
        descripcion={editar.modal.descripcion}
        alCancelar={() => editar.modal.setAbierto(false)}
        alConfirmar={editar.modal.alConfirmar}
        textoConfirmar={editar.modal.textoConfirmar}
        peligro={editar.modal.peligro}
      />

      <TarjetaPagina
        titulo="EDITAR RESERVA"
        izquierda={
          <button
            type="button"
            onClick={() => navigate(from)}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            ← Volver
          </button>
        }
        derecha={<span />}
      >
        <div className="space-y-6">
          <CamposBaseReserva
            formulario={editar.formulario}
            alCambiar={editar.aplicarCambios}
            mostrarId={true}
            mostrarEstado={true}
          />

          <SeccionChecks
            formulario={editar.formulario}
            alCambiar={editar.aplicarCambios}
          />

          {/* Aula: en editar siempre es un único selector (simple) */}
          <SeccionSelectorAula
            alBuscarAulas={editar.buscarAulas}
            estaBuscando={editar.buscandoAulas}
            puedeBuscar={editar.puedeBuscarAulas}
            modo="simple"
            aulasDisponibles={editar.aulasDisponibles}
            aulaSeleccionada={editar.formulario.nombre_aula}
            alSeleccionarAula={(nombre) => editar.aplicarCambios({ nombre_aula: nombre })}
            fechas={[]}
            aulasPorFecha={{}}
            seleccionPorFecha={{}}
            alSeleccionarPorFecha={() => {}}
          />

          <AccionesReserva
            variante="editar"
            alRechazar={editar.pedirRechazar}
            alAceptar={editar.pedirAprobar}
            alGuardar={editar.guardar}
            deshabilitarGuardar={!editar.puedeGuardar || !editar.hayCambios}
          />

          <CajaExito>{editar.mensaje}</CajaExito>
          <CajaError errores={editar.errores} />
        </div>
      </TarjetaPagina>
    </div>
  );
}
