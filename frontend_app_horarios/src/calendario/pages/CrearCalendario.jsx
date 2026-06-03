import React, { useState } from "react";
import SeccionFechas from "../componentes/SeccionFechas";
import SelectorFestivos from "../componentes/SelectorFestivos";
import { cargarCalendarioFormulario } from "../../api/calendario";
import BotonVolver from "../../reservas/formulario-componentes/ui/BotonVolver";


export default function CrearCalendario() {
    const [datos, setDatos] = useState({
        curso: "",
        fechaInicioCurso: "",
        fechaFinCurso: "",
        inicioSemestre1: "",
        finSemestre1: "",
        inicioSemestre2: "",
        finSemestre2: ""
    });

    const [festivos, setFestivos] = useState([]);

    const [mensajeCorrecto, setMensajeCorrecto] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);

    const manejarCambio = (campo, valor) => {
        setDatos(prev => ({ ...prev, [campo]: valor }));
    };

    const manejarGuardarCalendario = async (e) => {
        e.preventDefault();

        const expregCurso = /^\d{4}-\d{4}$/;
        if (!expregCurso.test(datos.curso)) {
            alert("El formato del curso académico es incorrecto. Debe ser YYYY-YYYY.");
            return;
        }

        if (!datos.fechaInicioCurso || !datos.fechaFinCurso || !datos.inicioSemestre1 || !datos.finSemestre1 || !datos.inicioSemestre2 || !datos.finSemestre2 || !datos.curso) {
            alert("Todas los campos son obligatorias.");
            return;
        }

        const payload = {
            curso: datos.curso,
            fecha_inicio_curso: datos.fechaInicioCurso,
            fecha_fin_curso: datos.fechaFinCurso,
            fecha_inicio_1_semestre: datos.inicioSemestre1,
            fecha_fin_1_semestre: datos.finSemestre1,
            fecha_inicio_2_semestre: datos.inicioSemestre2,
            fecha_fin_2_semestre: datos.finSemestre2,
            festivos: festivos, 
        };

        try {
            const respuesta = await cargarCalendarioFormulario(payload);


            setMensajeCorrecto("Calendario guardado correctamente.");
            console.log(respuesta.mensaje);

                        
        } catch (error) {
            console.error("Error al guardar el calendario:", error);
            setMensajeError(`No se pudo guardar el calendario`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white border border-[#c4a1a1] rounded-lg shadow-sm overflow-hidden">
                
                <div className="relative border-b border-[#c4a1a1] p-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <BotonVolver fallback="/horarios/cargar/cursos" />
                    </div>
                    <h2 className="text-center text-[#1E293B] text-lg font-bold tracking-wide uppercase">
                        Crear Calendario Académico
                    </h2>
                </div>

                <form onSubmit={manejarGuardarCalendario} className="p-6 space-y-8">
                    
                    <SeccionFechas datos={datos} onChange={manejarCambio} />

                    <SelectorFestivos 
                        fechaInicio={datos.fechaInicioCurso} 
                        fechaFin={datos.fechaFinCurso}
                        festivos={festivos}
                        setFestivos={setFestivos}
                    />

                    {mensajeCorrecto && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{mensajeCorrecto}</span>
                        </div>
                    )}

                    {mensajeError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{mensajeError}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            className="bg-[#b58b8b] hover:bg-[#9a7676] text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm"
                        >
                            Guardar Calendario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}