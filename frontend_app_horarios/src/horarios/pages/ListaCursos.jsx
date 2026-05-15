import { cargarHorarioExcel } from "../../api/docencia";
import ItemCurso from "../componentes/ItemCurso";
import { useNavigate } from "react-router-dom";
import { useCursos } from "../hooks/useCursos";
import React from "react";

export default function ListaCursos() {
  const navigate = useNavigate();

  const { cursos, cargando } = useCursos();

  console.log("Cursos obtenidos:", cursos);

  const enviarBack = async (archivo, idCurso) => {
    const formData = new FormData();
    formData.append('fichero', archivo);
    formData.append('id_curso', idCurso);

    
    try {
        const data = await cargarHorarioExcel(formData);
        
        alert(`¡Éxito! Archivo enviado para el curso ${idCurso}`);
        console.log("Respuesta de Django:", data);
        
        // Cerrar el desplegable
    } catch (error) {
        console.error("Fallo del servidor:", error);
        alert(`No se pudo cargar el archivo: ${error.message}`);
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
