import React, { useRef } from 'react';

/**
 * Componente para la cabecera de una tabla en el panel de administración.
 * Muestra el título de la tabla y los botones de acción disponibles.
 */
export default function CabeceraTabla({ 
    titulo, 
    mostrarFiltros, 
    alAlternarFiltros, 
    alCrear,
    alExportar,
    alDescargarPlantilla,
    alImportar
}) {

    // Referencia al input de archivo para poder activarlo desde el botón de importación
    const inputArchivoRef = useRef(null);

    const manejarCambioArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            alImportar(archivo);
            e.target.value = null; 
        }
    };

    return (
        <div className="mb-4 gap-4">
            <div className="mb-2 sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
                
                <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 justify-between">
                    <div className="flex flex-wrap gap-3">
                    <button
                        onClick={alAlternarFiltros}
                        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition-colors"
                    >
                        {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                    <button
                        onClick={alCrear}
                        className="rounded-md bg-[#7a1e1e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5e1717] transition-colors"
                    >
                        Crear Nuevo
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                    <button
                        onClick={alDescargarPlantilla}
                        className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        ⬇️ Descargar Plantilla
                    </button>
                    
                    <button
                        onClick={alExportar}
                        className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        📤 Exportar Datos
                    </button>

                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        className="hidden" 
                        ref={inputArchivoRef}
                        onChange={manejarCambioArchivo}
                    />
                    
                    <button
                        onClick={() => inputArchivoRef.current.click()}
                        className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                        📥 Importar Datos
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
}