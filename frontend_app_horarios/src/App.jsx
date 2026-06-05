import { BrowserRouter, Routes, Route } from "react-router-dom";
//import './App.css'

import PlantillaApp from './general/layout/PlantillaApp.jsx';

import RutaProtegida from "./auth/RutaProtegida.jsx";

//import SolicitudReserva from './reservas/SolicitudReserva.jsx'
import SolicitudReservas from './reservas/formulario-paginas/SolicitudReservas.jsx';
import FormularioCargar from './calendario/FormularioCargar.jsx';
//import SolicitudesPendientes from './reservas/SolicitudesPendientes.jsx';
import SolicitudesPendientes from './reservas/listado-paginas/SolicitudesPendientes.jsx';
//import TodasReservas from './reservas/listado-paginas/TodasReservas.jsx';
import EditarReservas from './reservas/formulario-paginas/EditarReservas.jsx';
import CrearReserva from './reservas/formulario-paginas/CrearReserva.jsx';

import Horarios from './horarios/pages/Horarios.jsx';
import OcupacionAulas from './aulas/pages/OcupacionAulas.jsx';
import OcupacionAulaCalendario from './aulas/pages/OcupacionAulaCalendario.jsx';
import Examenes from './examenes/Examenes.jsx';
import GestionReservas from './reservas/listado-paginas/GestionarReservas.jsx';
import LoginPage from "./login/LoginPage.jsx";
import ListaCursos from "./horarios/pages/ListaCursos.jsx";
import CrearCalendario from "./calendario/pages/CrearCalendario.jsx";

import ConsultaCalendarios from "./horarios/pages/ConsultarCalendarios.jsx";
import VistaDetalleCalendario from "./calendario/pages/VistaDetalleCalendario.jsx";
import LeyendaCalendario from "./calendario/componentes/LeyendaCalendario.jsx";
import VistaHorarioSemanalGrado from "./horarios/pages/HorarioSemanalPorGrado.jsx";
import CrearReservaPeriodica from "./reservas/reservas-periodicas/pages/CrearReservaPeriodica.jsx";
import DetallesReservaPeriodica from "./reservas/reservas-periodicas/pages/DetallesReservaPeriodica.jsx";
import EditarReservaPeriodica from "./reservas/reservas-periodicas/pages/EditarReservaPeriodica.jsx";
import ModalRestricciones from "./horarios/componentes/ModalRestricciones.jsx";

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
            <Route path="/reservas/gestion" element={<GestionReservas />} />
            <Route path="/reservas/solicitud" element={<SolicitudReservas />} />
            <Route path="/reservas/crear" element={<CrearReserva />} />
            <Route path="/reservas/pendientes" element={<SolicitudesPendientes />} />
            <Route path="/reservas/puntuales/:id" element={<EditarReservas />} />
            <Route path="/cargar-calendario" element={<FormularioCargar />} />
            <Route path="*" element={<h1>404 - No existe esa ruta</h1>} />

            <Route path="/horarios" element={<Horarios />} />
            <Route path="/horarios/cargar/cursos" element={<ListaCursos />} />
            {/* <Route path="/horarios/:id_curso/grados" element={<ListaGrados />} /> */}
            <Route path="/ocupacion-aulas" element={<OcupacionAulas />} />
            <Route path="/aulas/ocupacion/ver" element={<OcupacionAulaCalendario />} />
            <Route path="/examenes" element={<Examenes />} />

            <Route path="/calendario/crear" element={<CrearCalendario />} />
            <Route path="/calendario/cursos" element={<ConsultaCalendarios />} />
            <Route path="/calendario/cursos/:id_curso" element={<VistaDetalleCalendario />} />

            <Route path="/calendario/leyenda" element={<LeyendaCalendario />} />


            <Route path="/horarios/:id_curso" element={<VistaHorarioSemanalGrado />} />

            <Route path="/reservas/periodicas/crear" element={<CrearReservaPeriodica />} />
            <Route path="/reservas/periodicas/ver/:id" element={<DetallesReservaPeriodica />} />
            <Route path="/reservas/periodicas/editar/:id" element={<EditarReservaPeriodica />} />

            <Route path="/horarios/modal" element={<ModalRestricciones />} />

            <Route path="/admin">
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
  
  


    /*
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>*/
  )
}

export default App
