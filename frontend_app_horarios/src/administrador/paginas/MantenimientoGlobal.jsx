import React, { useState } from 'react';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

/*
 * Componente principal para el mantenimiento global del sistema en el panel de administración.
 * Permite exportar un backup completo, descargar una plantilla vacía y restaurar/importar datos desde un archivo Excel.
 * Incluye mensajes de éxito/error y un modal de confirmación para la importación debido a su naturaleza destructiva.
*/
export default function MantenimientoGlobal() {
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const [modalAbierto, setModalAbierto] = useState(false);
    const [archivoAImportar, setArchivoAImportar] = useState(null);

    const handleAction = async (actionFn, ...args) => {
        setCargando(true);
        setMensaje({ texto: '', tipo: '' });
        try {
            await actionFn(...args);
            setMensaje({ texto: 'Operación realizada con éxito.', tipo: 'success' });
        } catch (error) {
            console.error(error);
            setMensaje({ texto: 'Ocurrió un error al procesar la solicitud.', tipo: 'error' });
        } finally {
            setCargando(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivoAImportar(file);
            setModalAbierto(true);
        }
        e.target.value = null;
    };

    const confirmarImportacion = async () => {
        setModalAbierto(false);
        if (archivoAImportar) {
            setCargando(true);
            await handleAction(dbService.importarDatos, archivoAImportar, 'all');
            setArchivoAImportar(null);
        }
    };

    const cancelarImportacion = () => {
        setModalAbierto(false);
        setArchivoAImportar(null);
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Mantenimiento del Sistema</h1>
            <p className="text-slate-500 mb-6">Gestiona copias de seguridad e importaciones generales de la base de datos.</p>

            {mensaje.texto && (
                <div className={`p-4 rounded-lg mb-6 border ${
                    mensaje.tipo === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2">Exportar Todo</h2>
                    <p className="text-sm text-slate-500 mb-4">Descarga un backup completo en Excel con todas las tablas y datos del sistema.</p>
                    <button 
                        disabled={cargando}
                        onClick={() => handleAction(dbService.exportarDatos, 'all')}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {cargando ? 'Procesando...' : 'Descargar .XLSX'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2">Plantilla Global</h2>
                    <p className="text-sm text-slate-500 mb-4">Descarga el formato Excel vacío listo con todas las columnas de las tablas.</p>
                    <button 
                        disabled={cargando}
                        onClick={() => handleAction(dbService.descargarPlantilla, 'all')}
                        className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    >
                        {cargando ? 'Procesando...' : 'Descargar Estructura'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="font-semibold text-lg mb-2">Restaurar / Importar</h2>
                    <p className="text-sm text-slate-500 mb-4">Sube un Excel válido. Advertencia: Se sobrescribirán los datos de la base de datos.</p>
                    <label className={`w-full block text-center bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 cursor-pointer ${cargando ? 'opacity-50 pointer-events-none' : ''}`}>
                        {cargando ? 'Importando...' : 'Seleccionar y Subir'}
                        <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
            </div>
            <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-bold text-amber-800">
                            Recomendación de Seguridad
                        </h3>
                        <p className="mt-1 text-sm text-amber-700">
                            Antes de realizar cualquier importación, se recomienda utilizar la opción de{' '}
                            <button 
                                onClick={() => handleAction(dbService.exportarDatos, 'all')} 
                                className="font-semibold underline hover:text-amber-900 focus:outline-none"
                                disabled={cargando}
                            >
                                Exportar Todo
                            </button>
                            {' '}para guardar una copia de seguridad de la base de datos actual. Las importaciones son irreversibles.
                        </p>
                    </div>
                </div>
            </div>
            <ModalConfirmacion 
                isOpen={modalAbierto}
                mensaje="¡Atención! Importar este archivo borrará y reemplazará TODOS los datos actuales en la Base de Datos al completo. ¿Deseas continuar?"
                onConfirm={confirmarImportacion}
                onCancel={cancelarImportacion}
            />
        </div>
    );
}