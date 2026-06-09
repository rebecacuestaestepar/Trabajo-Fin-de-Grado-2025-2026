import { useNavigate, useLocation } from "react-router-dom";
import { useListadoReservas } from "../listado-hooks/useListadoReservas";

import BarraListado from "../listado-componentes/secciones/BarraListado";
import PanelFiltros from "../listado-componentes/secciones/PanelFiltros";
import ListaReservas from "../listado-componentes/secciones/ListaReservas";

import {
  getTodasReservas,
  getReservasUsuario,
  eliminarReserva,
  eliminarReservasMasivo,
} from "../../api/reservas";

export default function TodasReservas() {
  const navegar = useNavigate();
  const location = useLocation();

  const permisos = JSON.stringify(sessionStorage.getItem("permisos") || "[]");

  const puedoCrear = permisos.includes("add_reservapuntual");
  const puedoSolicitar = permisos.includes("request_reserv_puntual") || permisos.includes("view_own_reserva_puntual");

  const listado = useListadoReservas({
    cargador: puedoCrear ? getTodasReservas : getReservasUsuario,
    cargadorParams: puedoCrear ? [] : [sessionStorage.getItem("username") || ""],
  });
  

  const alCrear = () => {
    if (puedoCrear) {
      navegar("/reservas/crear", {
        state: { from: location.pathname + location.search },
      });
    } else if (puedoSolicitar) {
      navegar("/reservas/solicitud", {
        state: { from: location.pathname + location.search },
      });
    }
  };
  const alEditar = (id) =>
    navegar(`/reservas/puntuales/${id}`, {
      state: { from: location.pathname + location.search },
    });

  const alEliminar = (id) =>
    listado.ejecutarAccion(async () => {
      await eliminarReserva(id);
      listado.limpiarSeleccion();
    });

  const alEliminarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    const ids = Array.from(listado.idsSeleccionados);

    return listado.ejecutarAccion(async () => {
      await eliminarReservasMasivo(ids);
      listado.limpiarSeleccion();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Todas las reservas
            </h1>
            <p className="mt-2 text-slate-600">
              Listado completo con filtros, selección múltiple y eliminación masiva.
            </p>
          </div>

          <BarraListado
            tituloAccionCrear="Crear Reserva"
            alCrear={alCrear}
            mostrarFiltros={listado.mostrarFiltros}
            setMostrarFiltros={listado.setMostrarFiltros}
            todoVisibleSeleccionado={listado.todoVisibleSeleccionado}
            algunoVisibleSeleccionado={listado.algunoVisibleSeleccionado}
            alAlternarSeleccionarTodoVisible={listado.alternarSeleccionTodoVisible}
            totalFiltradas={listado.reservasFiltradas.length}
            total={listado.reservas.length}
            cantidadSeleccionadas={listado.cantidadSeleccionadas}
            alLimpiarSeleccion={listado.limpiarSeleccion}
            accionesMasivas={[
              {
                label: "Eliminar reservas",
                onClick: alEliminarSeleccionadas,
                disabled: listado.accionando,
                className: `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  ${
                    listado.accionando
                      ? "!bg-slate-400 cursor-not-allowed"
                      : "!bg-slate-900 hover:!bg-slate-800"
                  }`,
              },
            ]}
          />

          <PanelFiltros
            mostrar={listado.mostrarFiltros}
            usarMotivo={listado.usarMotivo}
            setUsarMotivo={listado.setUsarMotivo}
            usarResponsable={listado.usarResponsable}
            setUsarResponsable={listado.setUsarResponsable}
            usarRango={listado.usarRango}
            setUsarRango={listado.setUsarRango}
            filtroMotivo={listado.filtroMotivo}
            setFiltroMotivo={listado.setFiltroMotivo}
            filtroResponsable={listado.filtroResponsable}
            setFiltroResponsable={listado.setFiltroResponsable}
            filtroDesde={listado.filtroDesde}
            setFiltroDesde={listado.setFiltroDesde}
            filtroHasta={listado.filtroHasta}
            setFiltroHasta={listado.setFiltroHasta}
            alLimpiar={listado.limpiarFiltros}
          />
        </div>

        <div className="mt-6">
          {listado.cargando && (
            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-slate-700">Cargando reservas…</p>
            </div>
          )}

          {listado.error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {listado.error}
            </div>
          )}

          {!listado.cargando && !listado.error && listado.reservasFiltradas.length === 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 ring-1 ring-slate-200">
              No hay reservas con estos filtros.
            </div>
          )}

          {!listado.cargando && !listado.error && listado.reservasFiltradas.length > 0 && (
            <ListaReservas
              reservas={listado.reservasFiltradas}
              idsSeleccionados={listado.idsSeleccionados}
              alAlternarSeleccionUno={listado.alternarSeleccionUno}
              mostrarAceptarRechazar={false}
              mostrarEliminar={true}
              mostrarEstado={true}
              alAceptar={null}
              alRechazar={null}
              alEliminar={alEliminar}
              alEditar={alEditar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
