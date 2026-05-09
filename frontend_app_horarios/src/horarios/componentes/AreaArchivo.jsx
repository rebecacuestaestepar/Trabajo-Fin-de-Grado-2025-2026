import React, { useState, useRef } from "react";

const AreaArchivo = ({ idCurso, onArchivoSeleccionado }) => {
    const [arrastrando, setArrastrando] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const areaRef = useRef(null);

    const prevenirDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const manejarDragOver = (e) => {
        prevenirDefault(e);
        if (!archivoSeleccionado) setArrastrando(true);
    };

    const manejarDragLeave = (e) => {
        prevenirDefault(e);
        setArrastrando(false);
    };

    const manejarDrop = (e) => {
        prevenirDefault(e);
        setArrastrando(false);
        if (!archivoSeleccionado) {
            const archivos = e.dataTransfer.files;
            validarYProcesarArchivo(archivos[0]);
        }
    };

    const manejarSeleccionArchivo = (e) => {
        const archivo = e.target.files[0];
        validarYProcesarArchivo(archivo);
        e.target.value = null; // Reiniciar el input para permitir seleccionar el mismo archivo nuevamente si es necesario
    }

    const validarYProcesarArchivo = (archivo) => {
        if (!archivo) return;
        if (
            archivo.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            archivo.type === "application/vnd.ms-excel" ||
            archivo.name.endsWith('.xlsx') ||
            archivo.name.endsWith('.xls')
        ) {
            setArchivoSeleccionado(archivo);
        } else {
            alert("Archivo no válido. Por favor, selecciona un archivo Excel (.xlsx o .xls).");
        }
    };

    const eliminarArchivo = (e) => {
        e.stopPropagation();
        setArchivoSeleccionado(null);
    };

    const enviarArchivo = (e) => {
        e.stopPropagation();
        if (archivoSeleccionado) {
            onArchivoSeleccionado(archivoSeleccionado, idCurso);
        }
    };

    return (
        <div className="mt-4">
            {!archivoSeleccionado ? (
                <div
                    className={`p-10 text-center rounded-lg cursor-pointer transition-colors duration-200 ease-in-out border-2 border-dashed ${
                        arrastrando 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                    onDragEnter={prevenirDefault}
                    onDragOver={manejarDragOver}
                    onDragLeave={manejarDragLeave}
                    onDrop={manejarDrop}
                    onClick={() => areaRef.current.click()}
                >
                    <input
                        type="file"
                        ref={areaRef}
                        className="hidden"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={manejarSeleccionArchivo}
                    />
                    <p className="text-gray-600">{arrastrando ? "Adjunte el Excel aquí" : "Arrastre su Excel aquí o haga clic para buscar"}</p>
                    <p className="mt-2 text-xs text-slate-400">
                        Formatos admitidos: .xlsx, .xls
                    </p>
                </div>
            ) : (
                <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col items-center">
                    <div className="flex items-center justify-between w-full max-w-md bg-slate-50 p-3 rounded-md border border-slate-200">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            {/* Icono de Excel simple */}
                            <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="truncate text-sm text-slate-700 font-medium">
                                {archivoSeleccionado.name}
                            </span>
                        </div>
                        <button 
                            onClick={eliminarArchivo} 
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Eliminar archivo"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <button 
                        onClick={enviarArchivo}
                        className="mt-5 bg-[#7a1e1e] text-white px-6 py-2 rounded-md font-medium hover:bg-[#651818] focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 transition-all shadow-sm flex items-center space-x-2"
                    >
                        <span>Cargar archivo</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default AreaArchivo;