import React from "react";
import { Campo } from "../../reservas/formulario-componentes/ui/Campo";
import { EntradaTexto } from "../../reservas/formulario-componentes/ui/Inputs";

export default function SeccionFechas({ datos, onChange}) {
    datos = {
        curso: "",
        fechaInicioCurso: "",
        fechaFinCurso: "",
        inicioSemestre1: "",
        finSemestre1: "",
        inicioSemestre2: "",
        finSemestre2: ""
    };
    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta ="Curso académico" pista="Formato YYYY-YYYY">
                    <EntradaTexto
                    type="text"
                    placeholder="Ej: 2023-2024"
                    maxLength={9}
                    value={datos.curso || ""}
                    onChange={(e) => onChange( 'curso', e.target.value )}
                    required
                    />
                </Campo>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-slate-50 border border-slate-100 rounded-md">
                <Campo etiqueta="Inicio del Curso">
                    <EntradaTexto
                        type="date"
                        value={datos.fechaInicioCurso || ""}
                        onChange={(e) => onChange('fechaInicioCurso', e.target.value)}
                        required
                    />
                </Campo>
                <Campo etiqueta="Fin del Curso">
                    <EntradaTexto
                        type="date"
                        value={datos.fechaFinCurso || ""}
                        onChange={(e) => onChange('fechaFinCurso', e.target.value)}
                        required
                    />
                </Campo>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Campo etiqueta="Inicio 1º Semestre">
                    <EntradaTexto
                        type="date"
                        value={datos.inicioSemestre1 || ""}
                        onChange={(e) => onChange('inicioSemestre1', e.target.value)}
                        required
                    />
                </Campo>
                <Campo etiqueta="Fin 1º Semestre">
                    <EntradaTexto
                        type="date"
                        value={datos.finSemestre1 || ""}
                        onChange={(e) => onChange('finSemestre1', e.target.value)}
                        required
                    />
                </Campo>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Campo etiqueta="Inicio 2º Semestre">
                    <EntradaTexto
                        type="date"
                        value={datos.inicioSemestre2 || ""}
                        onChange={(e) => onChange('inicioSemestre2', e.target.value)}
                        required
                    />
                </Campo>
                <Campo etiqueta="Fin 2º Semestre">
                    <EntradaTexto
                        type="date"
                        value={datos.finSemestre2 || ""}
                        onChange={(e) => onChange('finSemestre2', e.target.value)}
                        required
                    />
                </Campo>
            </div>
        </div>
    );
}