import ItemCurso from "../componentes/ItemCurso";
import { useCursos } from "../hooks/useCursos";
import { useNavigate } from "react-router-dom";
import { eliminarCalendarioCurso } from "../../api/calendario";
import React, { useState } from "react";
import ModalConfirmacion from "../../shared/modales/ModalConfirmacion";

export default function ConsultaCalendarios() {
  const { cursos, cargando, recargarCursos } = useCursos();
  const navigate = useNavigate();

  const [modalAbierta, setModalAbierta] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);


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

    const pedirEliminar = (idCurso) => {
        setCursoAEliminar(idCurso);
        setModalAbierta(true);
    }

    const confirmarEliminar = async () => {
        if (!cursoAEliminar) return;
        try {
            await eliminarCalendarioCurso(cursoAEliminar);
            if (recargarCursos) {
                recargarCursos();
            }
        } catch (error) {
            console.error("Error al eliminar el curso:", error);
        } finally {
            setModalAbierta(false);
            setCursoAEliminar(null);
        }
    };

    const cancelarEliminar = () => {
        setModalAbierta(false);
        setCursoAEliminar(null);
    };

    return (
    <div className="p-4 relaative">
        <ModalConfirmacion
            isOpen={modalAbierta}
            mensaje={`¿Estás seguro de que deseas eliminar el Curso ${cursoAEliminar}? Esta acción eliminará en cascada todos los semestres, dias y reservas asociadas. Esta acción NO se puede deshacer.`}
            onConfirm={confirmarEliminar}
            onCancel={cancelarEliminar}
        />

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
                            onEliminar={pedirEliminar}
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