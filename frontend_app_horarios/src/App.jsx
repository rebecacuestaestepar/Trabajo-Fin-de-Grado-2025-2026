import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import PlantillaApp from './general/layout/PlantillaApp.jsx';

import RutaProtegida from "./auth/RutaProtegida.jsx";
import RequierePermiso from "./auth/RequierePermiso.jsx";

import SolicitudReservas from './reservas/formulario-paginas/SolicitudReservas.jsx';
import EditarReservas from './reservas/formulario-paginas/EditarReservas.jsx';
import CrearReserva from './reservas/formulario-paginas/CrearReserva.jsx';

import Horarios from './horarios/pages/Horarios.jsx';
import OcupacionAulas from './aulas/pages/OcupacionAulas.jsx';
import OcupacionAulaCalendario from './aulas/pages/OcupacionAulaCalendario.jsx';
import GestionReservas from './reservas/listado-paginas/GestionarReservas.jsx';
import LoginPage from "./login/LoginPage.jsx";
import ListaCursos from "./horarios/pages/ListaCursos.jsx";
import CrearCalendario from "./calendario/pages/CrearCalendario.jsx";

import ConsultaCalendarios from "./horarios/pages/ConsultarCalendarios.jsx";
import VistaDetalleCalendario from "./calendario/pages/VistaDetalleCalendario.jsx";
import VistaHorarioSemanalGrado from "./horarios/pages/HorarioSemanalPorGrado.jsx";
import CrearReservaPeriodica from "./reservas/reservas-periodicas/pages/CrearReservaPeriodica.jsx";
import DetallesReservaPeriodica from "./reservas/reservas-periodicas/pages/DetallesReservaPeriodica.jsx";
import EditarReservaPeriodica from "./reservas/reservas-periodicas/pages/EditarReservaPeriodica.jsx";

import GestionAulas from "./administrador/gestores/GestionAulas.jsx";
import CrearAula from "./administrador/campos-formulario/aulas/CrearAula.jsx";
import EditarAula from "./administrador/campos-formulario/aulas/EditarAula.jsx";

import GestionAsignaturas from "./administrador/gestores/GestionAsignaturas.jsx";
import CrearAsignatura from "./administrador/campos-formulario/asignaturas/CrearAsignatura.jsx";
import EditarAsignatura from "./administrador/campos-formulario/asignaturas/EditarAsignatura.jsx";

import GestionGrados from "./administrador/gestores/GestionGrados.jsx";
import CrearGrado from "./administrador/campos-formulario/grados/CrearGrado.jsx";
import EditarGrado from "./administrador/campos-formulario/grados/EditarGrado.jsx";

import GestionGrupos from "./administrador/gestores/GestionGrupos.jsx";
import CrearGrupo from "./administrador/campos-formulario/grupos/CrearGrupo.jsx";
import EditarGrupo from "./administrador/campos-formulario/grupos/EditarGrupo.jsx";

import GestionDocentes from "./administrador/gestores/GestionDocentes.jsx";
import CrearDocente from "./administrador/campos-formulario/docentes/CrearDocente.jsx";
import EditarDocente from "./administrador/campos-formulario/docentes/EditarDocente.jsx";

import GestionResponsables from "./administrador/gestores/GestionResponsable.jsx";
import CrearResponsable from "./administrador/campos-formulario/responsables/CrearResponsable.jsx";
import EditarResponsable from "./administrador/campos-formulario/responsables/EditarResponsable.jsx";

import GestionImparte from "./administrador/gestores/GestionImparte.jsx";
import CrearImparte from "./administrador/campos-formulario/imparte/CrearImparte.jsx";
import EditarImparte from "./administrador/campos-formulario/imparte/EditarImparte.jsx";

import GestionRoles from "./administrador/gestores/GestionRoles.jsx";
import CrearRol from "./administrador/campos-formulario/roles/CrearRol.jsx";
import EditarRol from "./administrador/campos-formulario/roles/EditarRol.jsx";

import GestionUsuarios from "./administrador/gestores/GestionUsuarios.jsx";
import CrearUsuario from "./administrador/campos-formulario/usuarios/CrearUsuario.jsx";
import EditarUsuario from "./administrador/campos-formulario/usuarios/EditarUsuario.jsx";

import MantenimientoGlobal from "./administrador/paginas/MantenimientoGlobal.jsx";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<RutaProtegida />}>
          <Route element={<PlantillaApp />}>
            <Route 
              path="/reservas/gestion" 
              element={
                <RequierePermiso permisos={["view_reserva", "view_reservapuntual", "view_own_reserva", "view_own_reservapuntual"]} condicion="alguno">
                  <GestionReservas />
                </RequierePermiso>
              } 
            />
          
            <Route path="/reservas/solicitud" element={<SolicitudReservas />} />

            <Route 
              path="/reservas/crear"
              element={
                <RequierePermiso permisos={["add_reserva", "add_reservapuntual"]} condicion="alguno">
                  <CrearReserva />
                </RequierePermiso>
              } />
            {/* <Route path="/reservas/pendientes" element={<SolicitudesPendientes />} /> */}
            <Route
              path="/reservas/puntuales/:id" 
              element={
                <RequierePermiso permisos={["change_reserva", "change_reservapuntual", "request_reserv_puntual"]} condicion="alguno">
                  <EditarReservas />
                </RequierePermiso>
              } 
            />
            {/* <Route 
              path="/cargar-calendario" 
              element={
                <RequierePermiso permisos={["add_calendario"]} condicion="alguno">
                  <FormularioCargar />
                </RequierePermiso>
              } /> */}
            <Route path="*" element={<h1>404 - No existe esa ruta</h1>} />

            <Route 
              path="/horarios" 
              element={
                <RequierePermiso permisos={["view_reservaperiodica"]}>
                  <Horarios />
                </RequierePermiso>
              } 
            />
            <Route 
              path="/horarios/cargar/cursos" 
              element={
                <RequierePermiso permisos={["view_admin_panel"]} condicion="alguno">
                  <ListaCursos />
                </RequierePermiso>
              } />
            <Route 
              path="/ocupacion-aulas" 
              element={
                <RequierePermiso permisos={["view_ocupacion_aula"]}>
                  <OcupacionAulas />
                </RequierePermiso>
              } />
            <Route 
              path="/aulas/ocupacion/ver" 
              element={
                <RequierePermiso permisos={["view_ocupacion_aula"]}>
                  <OcupacionAulaCalendario />
                </RequierePermiso>
              } />

            <Route 
              path="/calendario/crear" 
              element={
                <RequierePermiso permisos={["add_curso"]}>
                  <CrearCalendario />
                </RequierePermiso>
              } />
            <Route 
              path="/calendario/cursos" 
              element={
                <RequierePermiso permisos={["view_curso"]}>
                  <ConsultaCalendarios />
                </RequierePermiso>
              } />
            <Route 
              path="/calendario/cursos/:id_curso" 
              element={
                <RequierePermiso permisos={["view_curso"]}>
                  <VistaDetalleCalendario />
                </RequierePermiso>
              } />

            <Route 
              path="/horarios/:id_curso" 
              element={
                <RequierePermiso permisos={["view_reservaperiodica", "view_reserva"]} condicion="todos">
                  <VistaHorarioSemanalGrado />
                </RequierePermiso>
              } />

            <Route 
              path="/reservas/periodicas/crear" 
              element={
                <RequierePermiso permisos={["add_reservaperiodica"]}>
                  <CrearReservaPeriodica />
                </RequierePermiso>
              } />
            <Route 
              path="/reservas/periodicas/ver/:id" 
              element={
                <RequierePermiso permisos={["view_reservaperiodica"]}>
                  <DetallesReservaPeriodica />
                </RequierePermiso>
              } />
            <Route 
              path="/reservas/periodicas/editar/:id" 
              element={
                <RequierePermiso permisos={["change_reservaperiodica"]}>
                  <EditarReservaPeriodica />
                </RequierePermiso>
              } />

            <Route path="/admin" element={
              <RequierePermiso permisos={["view_admin_panel"]}>
                <Outlet />
              </RequierePermiso>
            }>
              <Route path="aulas" element={<GestionAulas/>} />
              <Route path="aulas/crear" element={<CrearAula/>} />
              <Route path="aulas/editar/:id" element={<EditarAula/>} />

              <Route path="asignaturas" element={<GestionAsignaturas/>} />
              <Route path="asignaturas/crear" element={<CrearAsignatura/>} />
              <Route path="asignaturas/editar/:id" element={<EditarAsignatura/>} />

              <Route path="grados" element={<GestionGrados/>} />
              <Route path="grados/crear" element={<CrearGrado/>} />
              <Route path="grados/editar/:id" element={<EditarGrado/>} />

              <Route path="grupos" element={<GestionGrupos/>} />
              <Route path="grupos/crear" element={<CrearGrupo/>} />
              <Route path="grupos/editar/:id" element={<EditarGrupo/>} />

              <Route path="docentes" element={<GestionDocentes/>} />
              <Route path="docentes/crear" element={<CrearDocente/>} />
              <Route path="docentes/editar/:id" element={<EditarDocente/>} />

              <Route path="responsables" element={<GestionResponsables/>} />
              <Route path="responsables/crear" element={<CrearResponsable/>} />
              <Route path="responsables/editar/:correo" element={<EditarResponsable/>} />

              <Route path="imparte" element={<GestionImparte/>} />
              <Route path="imparte/crear" element={<CrearImparte/>} />
              <Route path="imparte/editar/:id" element={<EditarImparte/>} />

              <Route path="roles" element={<GestionRoles/>} />
              <Route path="roles/crear" element={<CrearRol/>} />
              <Route path="roles/editar/:id" element={<EditarRol/>} />

              <Route path="usuarios" element={<GestionUsuarios/>} />
              <Route path="usuarios/crear" element={<CrearUsuario/>} />
              <Route path="usuarios/editar/:id" element={<EditarUsuario/>} />

              <Route path="mantenimiento-global" element={<MantenimientoGlobal />} />
            </Route>

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
