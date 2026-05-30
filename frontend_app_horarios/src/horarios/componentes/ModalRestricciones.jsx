import React from 'react';

export default function ModalRestricciones({ 
    abierto, 
    motivos, 
    onCancelar, 
    onContinuar 
}) {

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-slate-200 animate-in zoom-in-95 duration-200">
                
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="text-amber-500 text-2xl">⚠️</span> 
                    Advertencia de Movimiento
                </h2>
                
                <p className="text-slate-600 mb-4 text-sm">
                    El movimiento que intentas realizar incumple las siguientes restricciones:
                </p>
                
                <ul className="mb-6 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {motivos.map((motivo, idx) => (
                        <li key={idx} className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{motivo}</span>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button 
                        onClick={onCancelar} 
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onContinuar} 
                        className="px-4 py-2 text-sm font-medium text-white bg-[#7a1e1e] hover:bg-[#631818] rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#7a1e1e] focus:ring-offset-2"
                    >
                        Continuar de todos modos
                    </button>
                </div>

            </div>
        </div>
    );
}