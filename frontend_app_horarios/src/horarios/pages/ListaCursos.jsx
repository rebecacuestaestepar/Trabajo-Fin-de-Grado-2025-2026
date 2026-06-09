import { cargarHorarioExcel, validarHorarioCargado, obtenerNumeroClases } from "../../api/docencia";
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

  const { cursos, cargando } = useCursos();

  const [modalAdvertencia, setModalAdvertencia] = useState({
    abierto: false,
    archivo: null,
    idCurso: null,
    numReservas: 0,
    validando: false,
  });

  const [modalReservas, setModalReservas] = useState({
    abierto: false,
    archivo: null,
    idCurso: null,
    clasesExtraidas: 0,
    analizando: false,
  });


  const manejarIntentoCarga = async (archivo, idCurso) => {
    setError(null);
    
    setModalAdvertencia({
      abierto: true,
      archivo: archivo,
      idCurso: idCurso,
      numReservas: 0,
      validando: true,
    });

    try {
      const data = await validarHorarioCargado(idCurso);

      if (data.horario_cargado) {
        setModalAdvertencia((prev) => ({
          ...prev,
          numReservas: data.num_reservas,
          validando: false,
        }));
      } else {
        setModalAdvertencia({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
        await enviarBack(archivo, idCurso);
      }
    } catch (e) {
      console.error("Error al validar el curso:", e);
      setError("No se pudo verificar el estado actual del curso. Inténtalo de nuevo.");
      setModalAdvertencia({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
    }
  };

  const analizarReservas = async (archivo, idCurso) => {
    setModalAdvertencia({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
    
    setModalReservas({
      abierto: true,
      archivo: archivo,
      idCurso: idCurso,
      clasesExtraidas: 0,
      analizando: true,
    });

    try {
      const data = await obtenerNumeroClases(archivo);
      
      setModalReservas((prev) => ({
        ...prev,
        clasesExtraidas: data.num_clases,
        analizando: false,
      }));
    } catch (e) {
      console.error("Error al analizar el excel:", e);
      setError(e.detail || e.error || "El Excel está mal formateado y no se pudo leer.");
      setModalReservas({ abierto: false, archivo: null, idCurso: null, clasesExtraidas: 0, analizando: false });
    }
  };



  const enviarBack = async (archivo, idCurso) => {

    setModalReservas({ abierto: false, archivo: null, idCurso: null, clasesExtraidas: 0, analizando: false });
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
    setModalAdvertencia({ abierto: false, archivo: null, idCurso: null, numReservas: 0, validando: false });
  };

  const tituloModal = modalAdvertencia.validando 
    ? "Verificando el curso..." 
    : "¡Atención! Curso con horario cargado";

    const mensajeModal = modalAdvertencia.validando
    ? "Consultando la base de datos para verificar el estado de este curso..."
    : `El curso ${modalAdvertencia.idCurso} ya tiene un horario registrado. Si continúas, se borrarán las ${modalAdvertencia.numReservas} reservas periódicas que existen actualmente para este curso. ¿Deseas continuar?`;

    const tituloModalRes = modalReservas.analizando
    ? "Analizando archivo..."
    : "Resultados del análisis";

  const mensajeModalRes = modalReservas.analizando
    ? "Leyendo el archivo Excel para extraer las clases. Por favor, espera..."
    : `Se han extraído con éxito ${modalReservas.clasesExtraidas} clases base del archivo Excel. Estas se multiplicarán para generar todas las reservas de cada semana lectiva. ¿Estás de acuerdo con este número y deseas crear el horario definitivo?`;

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
                        Generando datos para el curso.... Este proceso puede tardar un par de minutos, por favor, no cierres esta ventana ni navegues a otra página.
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
        isOpen={modalAdvertencia.abierto}
        titulo={tituloModal}
        mensaje={mensajeModal}
        onConfirm={() => analizarReservas(modalAdvertencia.archivo, modalAdvertencia.idCurso)}
        onCancel={cancelarCarga}
        disabled={modalAdvertencia.validando} 
        />
        <ModalConfirmacion
        isOpen={modalReservas.abierto}
        titulo={tituloModalRes}
        mensaje={mensajeModalRes}
        onConfirm={() => enviarBack(modalReservas.archivo, modalReservas.idCurso)}
        onCancel={cancelarCarga}
        disabled={modalReservas.analizando} 
      />
    </div>
  );
}
