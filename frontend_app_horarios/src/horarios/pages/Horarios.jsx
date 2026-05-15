import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ItemCurso from "../componentes/ItemCurso";
import { obtenerCursosConHorario } from "../../api/docencia";

export default function Horarios() {
  const navigate = useNavigate();

  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const datos = await obtenerCursosConHorario();
        setHorarios(datos);
      } catch (err) {
        console.error("Error al obtener los cursos con horario:", err);
        setError("Error al obtener los cursos con horario");
      } finally {
        setCargando(false);
      }
    };
    cargarHorarios();
  }, []);

  const verCursos = () => {
    navigate("/horarios/cargar/cursos");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Horarios Académicos</h1>
        <button
          type="button"
          onClick={verCursos}
          className={[
            "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
            "bg-[#7a1e1e] hover:bg-[#651818]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "mt-4",
          ].join(" ")}>
            Cargar Nuevo Horario
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-transparent overflow-hidden">

          {cargando && <div className="p-10 text-center text-slate-500">Buscando horarios...</div>}

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {horarios.length === 0 && !error ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500">
                    No hay horarios importados todavía.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {horarios.map((horario) => (
                        <ItemCurso
                            key={horario.idcurso}
                            idCurso={horario.idcurso}
                            modoNavegacion={true}
                            rutaDestino={`/horarios/${horario.idcurso}`}
                            titulo={`Horario del curso ${horario.idcurso}`}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
