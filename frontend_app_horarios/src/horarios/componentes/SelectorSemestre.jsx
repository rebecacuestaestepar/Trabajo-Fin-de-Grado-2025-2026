import React from "react";

export default function SelectorSemestre({idCurso, idGrado, semestres, semestreActivo, onSeleccionarSemestre, cargando}) {
    semestres = [1, 2, 3, 4, 5, 6, 7, 8]
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Horario Semanal</h1>
                <p className="text-sm text-slate-500">Grado: <span className="font-semibold">{idGrado}</span> | Curso: <span className="font-semibold">{idCurso}</span></p>
            </div>

            <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">Semestre:</label>
                <select 
                    className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    value={semestreActivo}
                    onChange={(e) => onSeleccionarSemestre(Number(e.target.value))}
                    disabled={cargando || semestres.length === 0}
                >
                    {semestres.length === 0 && <option value="">Sin semestres</option>}
                    {semestres.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}