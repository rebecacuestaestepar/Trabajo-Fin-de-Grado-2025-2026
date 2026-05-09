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
            fecha_inicio: datos.fechaInicioCurso,
            fecha_fin: datos.fechaFinCurso,
            semestre1_inicio: datos.inicioSemestre1,
            semestre1_fin: datos.finSemestre1,
            semestre2_inicio: datos.inicioSemestre2,
            semestre2_fin: datos.finSemestre2,
            festivos: festivos, 
        };

        try {
            const respuesta = await cargarCalendarioFormulario(payload);


            if (respuesta != null && !respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(errorData.detail || "Error al guardar el calendario.");
            } else {
                alert("Calendario guardado correctamente.");
            }
            
            // Opcional: Redirigir a otra página (Ej: navigate('/horarios')) o limpiar el estado
            
        } catch (error) {
            console.error("Error al guardar el calendario:", error);
            alert(`Fallo en el servidor: ${error.message}`);
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