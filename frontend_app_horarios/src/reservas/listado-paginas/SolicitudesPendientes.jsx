import { useNavigate } from "react-router-dom";
import { useListadoReservas } from "../listado-hooks/useListadoReservas";

import BarraListado from "../listado-componentes/secciones/BarraListado";
import PanelFiltros from "../listado-componentes/secciones/PanelFiltros";
import ListaReservas from "../listado-componentes/secciones/ListaReservas";

import {
  getReservasPendientes,
  aprobarReserva,
  rechazarReserva,
  aprobarReservasMasivo,
  rechazarReservasMasivo,
} from "../../api/reservas";

export default function SolicitudesPendientes() {
  const navegar = useNavigate();

  const listado = useListadoReservas({
    cargador: getReservasPendientes,
  });

  const alEditar = (id) => navegar(`/reservas/pendientes/${id}`);

  const alAceptar = (id) =>
    listado.ejecutarAccion(async () => {
      await aprobarReserva(id);
    });

  const alRechazar = (id) =>
    listado.ejecutarAccion(async () => {
      await rechazarReserva(id);
    });

  const alAceptarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    const ids = Array.from(listado.idsSeleccionados);

    return listado.ejecutarAccion(async () => {
      await aprobarReservasMasivo(ids);
      listado.limpiarSeleccion();
    });
  };

  const alRechazarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    const ids = Array.from(listado.idsSeleccionados);

    return listado.ejecutarAccion(async () => {
      await rechazarReservasMasivo(ids);
      listado.limpiarSeleccion();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Solicitudes pendientes
            </h1>
            <p className="mt-2 text-slate-600">
              Lista de solicitudes con estado{" "}
              <span className="font-semibold">Pendiente</span>.
            </p>
          </div>

          <BarraListado
            tituloAccionCrear={null}
            alCrear={null}
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
                label: "Aceptar reservas",
                onClick: alAceptarSeleccionadas,
                disabled: listado.accionando,
                className: `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  ${
                    listado.accionando
                      ? "!bg-emerald-300 cursor-not-allowed"
                      : "!bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                  }`,
              },
              {
                label: "Rechazar reservas",
                onClick: alRechazarSeleccionadas,
                disabled: listado.accionando,
                className: `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  ${
                    listado.accionando
                      ? "!bg-red-300 cursor-not-allowed"
                      : "!bg-red-600 hover:bg-red-700 active:bg-red-800"
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
              <p className="text-slate-700">Cargando solicitudes…</p>
            </div>
          )}

          {listado.error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {listado.error}
            </div>
          )}

          {!listado.cargando && !listado.error && listado.reservasFiltradas.length === 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 ring-1 ring-slate-200">
              No hay solicitudes pendientes con estos filtros.
            </div>
          )}

          {!listado.cargando && !listado.error && listado.reservasFiltradas.length > 0 && (
            <ListaReservas
              reservas={listado.reservasFiltradas}
              idsSeleccionados={listado.idsSeleccionados}
              alAlternarSeleccionUno={listado.alternarSeleccionUno}
              mostrarAceptarRechazar={true}
              mostrarEliminar={false}
              alAceptar={alAceptar}
              alRechazar={alRechazar}
              alEliminar={null}
              alEditar={alEditar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
