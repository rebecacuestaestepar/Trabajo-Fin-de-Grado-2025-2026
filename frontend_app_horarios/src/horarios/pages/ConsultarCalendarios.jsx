import ItemCurso from "../componentes/ItemCurso";
import { useCursos } from "../hooks/useCursos";
import { useNavigate } from "react-router-dom";

export default function ConsultaCalendarios() {
  const { cursos, cargando } = useCursos();
  const navigate = useNavigate();

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
        <div className="flex items-center justify-between mb-4">
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
                            modoNavegacion={true}
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