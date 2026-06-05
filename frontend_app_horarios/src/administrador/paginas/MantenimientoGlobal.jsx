import React, { useState } from 'react';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

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
            <ModalConfirmacion 
                isOpen={modalAbierto}
                mensaje="¡Atención! Importar este archivo borrará y reemplazará TODOS los datos actuales en la Base de Datos al completo. ¿Deseas continuar?"
                onConfirm={confirmarImportacion}
                onCancel={cancelarImportacion}
            />
        </div>
    );
}