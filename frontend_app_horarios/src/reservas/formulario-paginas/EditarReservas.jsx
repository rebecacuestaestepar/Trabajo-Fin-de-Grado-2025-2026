import { useLocation, useNavigate, useParams } from "react-router-dom";

import TarjetaPagina from "../formulario-componentes/ui/TarjetaPagina";
import { ModalConfirmacion } from "../formulario-componentes/ui/ModalConfirmacion";
import { CajaExito, CajaError } from "../formulario-componentes/ui/CajaExito";
import BotonVolver from "../formulario-componentes/ui/BotonVolver";

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
          izquierda={<BotonVolver fallback="/reservas" />}
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

          <SeccionSelectorAula
            alBuscarAulas={editar.buscarAulas}
            estaBuscando={editar.buscandoAulas}
            puedeBuscar={editar.puedeBuscarAulas}
            modo="simple"
            aulasDisponibles={editar.aulasDisponibles}
            aulaSeleccionada={editar.formulario.nombre_aula}
            //alSeleccionarAula={(nombre) => editar.aplicarCambios({ nombre_aula: nombre })}
            alSeleccionarAula={(aulaElegida) => 
              editar.aplicarCambios({ 
                id_aula: editar.aulasDisponibles.find(a => a.nombre === aulaElegida)?.id || null,
                nombre_aula: aulaElegida
              })
            }
            fechas={[]}
            aulasPorFecha={{}}
            seleccionPorFecha={{}}
            alSeleccionarPorFecha={() => {}}
          />

          <AccionesReserva
            variante="editar"
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
