import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SolicitudReserva from './reservas/SolicitudReserva.jsx'
import FormularioCargar from './calendario/FormularioCargar.jsx';
import SolicitudesPendientes from './reservas/SolicitudesPendientes.jsx';
import SolicitudesPendientesDetalles from './reservas/SolicitudesPendientesDetalles.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reservas/solicitud" element={<SolicitudReserva />} />
        <Route path="/reservas/pendientes" element={<SolicitudesPendientes />} />
        <Route path="/reservas/pendientes/:id" element={<SolicitudesPendientesDetalles />} />
        <Route path="/cargar-calendario" element={<FormularioCargar />} />
        <Route path="*" element={<h1>404 - No existe esa ruta</h1>} />
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
