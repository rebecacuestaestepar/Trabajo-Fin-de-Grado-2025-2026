import React from "react";

export default function SelectorSemestre({idCurso, grados, gradoActivo, onSeleccionarGrado, semestres, semestreActivo, onSeleccionarSemestre, cargando}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Horario Semanal</h1>
                <p className="text-sm text-slate-500">Curso: <span className="font-semibold">{idCurso}</span></p>
            </div>

            <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-semibold text-slate-700">Grado:</label>
                    <select 
                        className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-[#7a1e1e] outline-none disabled:opacity-50 min-w-[200px]"
                        value={String(gradoActivo) || ""}
                        onChange={(e) => onSeleccionarGrado(e.target.value)}
                        disabled={cargando || grados.length === 0}
                    >
                        {grados.length === 0 && <option value="">Sin grados disponibles</option>}
                        {grados.length > 0 && !gradoActivo && <option value="" disabled>Selecciona un grado...</option>}
                        {grados.map(grado => (
                            <option key={grado.idgrado} value={grado.idgrado}>
                                {grado.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-end">
                    <label className="text-sm font-semibold text-slate-700">Semestre:</label>
                    <select 
                        className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-[#7a1e1e] outline-none disabled:opacity-50"
                        value={String(semestreActivo) || ""}
                        onChange={(e) => onSeleccionarSemestre(Number(e.target.value))}
                        disabled={cargando || semestres.length === 0 || !gradoActivo}
                    >
                        {semestres.length === 0 && <option value="">-</option>}
                        {semestres.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}