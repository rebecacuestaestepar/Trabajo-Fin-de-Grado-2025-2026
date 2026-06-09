import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useListadoReservas } from "../listado-hooks/useListadoReservas";

import BarraListado from "../listado-componentes/secciones/BarraListado";
import PanelFiltros from "../listado-componentes/secciones/PanelFiltros";
import ListaReservas from "../listado-componentes/secciones/ListaReservas";
import Paginador from "../listado-componentes/secciones/Paginador";

import ModalConfirmacion from "../../shared/modales/ModalConfirmacion";

import {
  getTodasReservas, 
  eliminarReserva,
  eliminarReservasMasivo,
  aprobarReserva,
  rechazarReserva,
  aprobarReservasMasivo,
  rechazarReservasMasivo,
  getReservasUsuario,
} from "../../api/reservas";

export default function GestionReservas() {
  const navegar = useNavigate();
  const location = useLocation();

  const permisos = JSON.stringify(sessionStorage.getItem("permisos") || "[]");

  const puedoCrear = permisos.includes("add_reservapuntual");
  const puedoSolicitar = permisos.includes("request_reserv_puntual") || permisos.includes("view_own_reserva_puntual");

  const correoUsuario = sessionStorage.getItem("username");
  const esUsuarioValido = correoUsuario && correoUsuario !== "undefined";
  
  const cargadorConfigurado = useMemo(() => {
    if (puedoCrear) {
      return getTodasReservas;
    }
    if (esUsuarioValido) {
      return () => getReservasUsuario(correoUsuario);
    }
    return null;
  }, [puedoCrear, esUsuarioValido, correoUsuario]);

  // 2. Se lo pasamos limpio al hook
  const listado = useListadoReservas({
    cargador: cargadorConfigurado,
  });

  const [modalEliminar, setModalEliminar] = useState({
    isOpen: false,
    tipo: null,
    id: null,
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

  const alAceptar = (id) => listado.ejecutarAccion(async () => await aprobarReserva(id));
  const alRechazar = (id) => listado.ejecutarAccion(async () => await rechazarReserva(id));
  const alEliminar = (id) => {
    setModalEliminar({ isOpen: true, tipo: 'individual', id: id });
  };

  const todasSeleccionadasSonPendientes = useMemo(() => {
    if (listado.idsSeleccionados.size === 0) return false;
    
    // Obtenemos los objetos completos de las reservas seleccionadas
    const itemsSeleccionados = listado.reservas.filter((r) => 
      listado.idsSeleccionados.has(r.id ?? r.idreserva)
    );

    // Verificamos si todas tienen estado Pendiente
    return itemsSeleccionados.every((r) => {
      const estadoStr = String(r.estado ?? r.estado_reserva ?? r.status ?? "").trim().toUpperCase();
      return estadoStr === "P";
    });
  }, [listado.idsSeleccionados, listado.reservas]);

  const alAceptarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    return listado.ejecutarAccion(async () => {
      await aprobarReservasMasivo(Array.from(listado.idsSeleccionados));
      listado.limpiarSeleccion();
    });
  };

  const alRechazarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    return listado.ejecutarAccion(async () => {
      await rechazarReservasMasivo(Array.from(listado.idsSeleccionados));
      listado.limpiarSeleccion();
    });
  };

  const alEliminarSeleccionadas = () => {
    if (listado.idsSeleccionados.size === 0) return;
    setModalEliminar({ isOpen: true, tipo: 'masiva', id: null });
  };

  const confirmarEliminacion = () => {
    if (modalEliminar.tipo === 'individual') {
      listado.ejecutarAccion(async () => {
        await eliminarReserva(modalEliminar.id);
        listado.limpiarSeleccion();
      });
    } else if (modalEliminar.tipo === 'masiva') {
      listado.ejecutarAccion(async () => {
        await eliminarReservasMasivo(Array.from(listado.idsSeleccionados));
        listado.limpiarSeleccion();
      });
    }
    // Cerramos el modal después de ejecutar
    setModalEliminar({ isOpen: false, tipo: null, id: null });
  };

  const cancelarEliminacion = () => {
    // Solo cerramos la modal
    setModalEliminar({ isOpen: false, tipo: null, id: null });
  };


  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    listado.limpiarError?.();
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const reservasPaginadas = useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return listado.reservasFiltradas.slice(inicio, fin);
  }, [listado.reservasFiltradas, page, rowsPerPage]);

  const [prevCantidadFiltrada, setPrevCantidadFiltrada] = useState(listado.reservasFiltradas.length);

  if (listado.reservasFiltradas.length !== prevCantidadFiltrada) {
    setPrevCantidadFiltrada(listado.reservasFiltradas.length);
    setPage(0);
  }

  const mensajeModal = modalEliminar.tipo === 'individual'
    ? "¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
    : `¿Estás seguro de que deseas eliminar las ${listado.idsSeleccionados.size} reservas seleccionadas? Esta acción no se puede deshacer.`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Gestión de Reservas
            </h1>
            <p className="mt-2 text-slate-600">
              Listado general de reservas. Usa los filtros para localizar solicitudes específicas.
            </p>
          </div>
          <BarraListado
            tituloAccionCrear="Crear Reserva"
            alCrear={alCrear}
            mostrarFiltros={listado.mostrarFiltros}
            setMostrarFiltros={listado.setMostrarFiltros}
            soloPendientes={listado.soloPendientes} 
            setSoloPendientes={listado.setSoloPendientes} 
            todoVisibleSeleccionado={listado.todoVisibleSeleccionado}
            algunoVisibleSeleccionado={listado.algunoVisibleSeleccionado}
            alAlternarSeleccionarTodoVisible={listado.alternarSeleccionTodoVisible}
            totalFiltradas={listado.reservasFiltradas.length}
            total={listado.reservas.length}
            cantidadSeleccionadas={listado.cantidadSeleccionadas}
            alLimpiarSeleccion={listado.limpiarSeleccion}
            accionesMasivas={[
              {
                label: "Aceptar",
                permisos: ["reservas.change_reservapuntual", "reservas.change_reserva"],
                onClick: alAceptarSeleccionadas,
                disabled: listado.accionando || !todasSeleccionadasSonPendientes,
                className: `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  ${
                    listado.accionando || !todasSeleccionadasSonPendientes
                      ? "!bg-emerald-300 cursor-not-allowed opacity-60"
                      : "!bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                  }`,
              },
              {
                label: "Rechazar",
                permisos: ["reservas.change_reservapuntual", "reservas.change_reserva"],
                onClick: alRechazarSeleccionadas,
                disabled: listado.accionando || !todasSeleccionadasSonPendientes,
                className: `rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                  ${
                    listado.accionando || !todasSeleccionadasSonPendientes
                      ? "!bg-red-300 cursor-not-allowed opacity-60"
                      : "!bg-red-600 hover:bg-red-700 active:bg-red-800"
                  }`,
              },
              {
                label: "Eliminar",
                permisos: ["reservas.delete_reservapuntual", "reservas.delete_reserva"],
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
          >
          

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
              alAplicar={listado.aplicarFiltros}
            />
            </BarraListado>
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

          {!listado.cargando && listado.reservasFiltradas.length > 0 && (
            <ListaReservas
              reservas={reservasPaginadas}
              idsSeleccionados={listado.idsSeleccionados}
              alAlternarSeleccionUno={listado.alternarSeleccionUno}
              mostrarEstado={true} 
              alAceptar={alAceptar}
              alRechazar={alRechazar}
              alEliminar={alEliminar}
              alEditar={alEditar}
            />
          )}
        </div>
        <Paginador
          count={listado.reservasFiltradas.length}
          page={page}
          onChangePage={handleChangePage}
          rowsPerPage={rowsPerPage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
      <ModalConfirmacion 
        isOpen={modalEliminar.isOpen}
        mensaje={mensajeModal}
        onConfirm={confirmarEliminacion}
        onCancel={cancelarEliminacion}
      />
    </div>
  );
}