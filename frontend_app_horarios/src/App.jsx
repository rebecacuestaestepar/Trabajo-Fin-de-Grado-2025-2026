import { BrowserRouter, Routes, Route } from "react-router-dom";
//import './App.css'

import PlantillaApp from './general/layout/PlantillaApp.jsx';

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

import ItemCurso from "./horarios/componentes/ItemCurso.jsx";
import SeccionFechas from "./calendario/componentes/SeccionFechas.jsx";
import SelectorFestivos from "./calendario/componentes/SelectorFestivos.jsx";



function App() {
  //const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PlantillaApp />}>

          <Route path="/reservas/gestion" element={<GestionReservas />} />
          <Route path="/reservas/solicitud" element={<SolicitudReservas />} />
          <Route path="/reservas/crear" element={<CrearReserva />} />
          <Route path="/reservas/pendientes" element={<SolicitudesPendientes />} />
          <Route path="/reservas/puntuales/:id" element={<EditarReservas />} />
          <Route path="/cargar-calendario" element={<FormularioCargar />} />
          {/* <Route path="/reservas/todas" element={<TodasReservas />} /> */}
          <Route path="*" element={<h1>404 - No existe esa ruta</h1>} />

          <Route path="/horarios" element={<Horarios />} />
          <Route path="/horarios/cargar/cursos" element={<ListaCursos />} />
          <Route path="/ocupacion-aulas" element={<OcupacionAulas />} />
          <Route path="/aulas/ocupacion/ver" element={<OcupacionAulaCalendario />} />
          <Route path="/examenes" element={<Examenes />} />

          <Route path="/campos/calendario" element={<SeccionFechas />} />
          <Route path="/festivos/calendario" element={<SelectorFestivos />} />
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
