import { cargarHorarioExcel } from "../../api/docencia";
import ItemCurso from "../componentes/ItemCurso";
import { useNavigate } from "react-router-dom";
import { useCursos } from "../hooks/useCursos";
import React, { useState } from "react";

export default function ListaCursos() {
  const navigate = useNavigate();

  const [generandoDatos, setGenerandoDatos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);
  

  const { cursos, cargando } = useCursos();

  console.log("Cursos obtenidos:", cursos);

  const enviarBack = async (archivo, idCurso) => {
    const formData = new FormData();
    formData.append('fichero', archivo);
    formData.append('id_curso', idCurso);

    setGenerandoDatos(true);
    try {
        const data = await cargarHorarioExcel(formData);
        
        setMensaje(`Se ha cargado el horario para el curso ${idCurso} correctamente.`);
        //console.log("Respuesta de Django:", data);
        
    } catch (error) {
        console.error("Fallo del servidor:", error);
        setError(`No se pudo cargar el archivo`);
    } finally {
        setGenerandoDatos(false);
    }
  };

  if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500 text-lg animate-pulse">Cargando cursos...</p>
            </div>
        );
    }
  
  const nuevoCurso = () => {
    navigate("/calendario/crear");
  };

  return (
    <div className="p-4">
        <div className="flex flex-wrap items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Lista de Cursos</h1>
            <button
                type="button"
                onClick={nuevoCurso}
                className={[
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
                    "bg-[#7a1e1e] hover:bg-[#651818]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "mt-4",
                ].join(" ")}>
                Cargar Nuevo Curso
            </button>
        </div>
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {error && (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                {mensaje && (
                    <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
                        {mensaje}
                    </div>
                )}
                {cursos.length > 0 ? (
                    cursos.map((curso) => (
                        <ItemCurso 
                            key={curso.idcurso} 
                            idCurso={curso.idcurso} 
                            enviarBack={enviarBack}
                            rutaDestino={`/calendario/cursos/${curso.idcurso}`}
                            titulo={`Curso ${curso.idcurso}`}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        No hay cursos disponibles.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
