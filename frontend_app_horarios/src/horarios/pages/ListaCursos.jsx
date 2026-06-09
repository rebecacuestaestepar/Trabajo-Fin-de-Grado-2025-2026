import { cargarHorarioExcel, validarHorarioCargado } from "../../api/docencia";
import ItemCurso from "../componentes/ItemCurso";
import { useNavigate } from "react-router-dom";
import { useCursos } from "../hooks/useCursos";
import React, { useState } from "react";

import RequierePermiso from "../../auth/RequierePermiso";
import ModalConfirmacion from "../../shared/modales/ModalConfirmacion";

export default function ListaCursos() {
  const navigate = useNavigate();

  const [generandoDatos, setGenerandoDatos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(null);

  const [modalCarga, setModalCarga] = useState({
    abierto: false,
    archivo: null,
    idCurso: null,
    numReservas: 0,
    validando: false,
  });

  const { cursos, cargando } = useCursos();

  const manejarIntentoCarga = async (archivo, idCurso) => {
    setError(null);
    
    // 1. Abrimos el modal instantáneamente en estado "Cargando/Validando"
    setModalCarga({
      abierto: true,
      archivo: archivo,
      idCurso: idCurso,
      numReservas: 0,
      validando: true,
    });

    try {
      const data = await validarHorarioCargado(idCurso);

      if (data.horario_cargado) {
        // 3a. SÍ HAY HORARIO: Actualizamos el modal para mostrar la advertencia
        setModalCarga((prev) => ({
          ...prev,
          numReservas: data.num_reservas,
          validando: false,
        }));
      } else {
        setModalCarga({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
        await enviarBack(archivo, idCurso);
      }
    } catch (e) {
      console.error("Error al validar el curso:", e);
      setError("No se pudo verificar el estado actual del curso. Inténtalo de nuevo.");
      setModalCarga({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
    }
  };

  const enviarBack = async (archivo, idCurso) => {
    const formData = new FormData();
    formData.append('fichero', archivo);
    formData.append('id_curso', idCurso);

    setGenerandoDatos(true);
    try {
        setError(null);
        setGenerandoDatos(true);
        await cargarHorarioExcel(formData);
        
        setMensaje(`Se ha cargado el horario para el curso ${idCurso} correctamente.`);
        
    } catch (error) {
        console.error("Fallo del servidor:", error);
        setError(`No se pudo cargar el archivo`);
    } finally {
        setGenerandoDatos(false);
    }
  };

  const cancelarCarga = () => {
    setModalCarga({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
  };

  const tituloModal = modalCarga.validando 
    ? "Verificando el curso..." 
    : "¡Atención! Curso con horario cargado";

    const mensajeModal = modalCarga.validando
    ? "Consultando la base de datos para verificar el estado de este curso..."
    : `El curso ${modalCarga.idCurso} ya tiene un horario registrado. Si continúas, se borrarán las ${modalCarga.numReservas} reservas periódicas que existen actualmente para este curso. ¿Deseas continuar?`;

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
            <RequierePermiso permisos={["add_curso"]}>
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
            </RequierePermiso>
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
                {generandoDatos && (
                    <div className="p-4 mb-4 text-black bg-grey-100 rounded">
                        Generando datos para el curso...
                    </div>
                )}
                {cursos.length > 0 ? (
                    cursos.map((curso) => (
                        <ItemCurso 
                            key={curso.idcurso} 
                            idCurso={curso.idcurso} 
                            enviarBack={manejarIntentoCarga}
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
        <ModalConfirmacion
        isOpen={modalCarga.abierto}
        titulo={tituloModal}
        mensaje={mensajeModal}
        onConfirm={() => enviarBack(modalCarga.archivo, modalCarga.idCurso)}
        onCancel={cancelarCarga}
        disabled={modalCarga.validando} 
      />
    </div>
  );
}
