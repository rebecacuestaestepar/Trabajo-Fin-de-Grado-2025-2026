import React, { useState, useMemo } from 'react';
import { TIPOS_DIA, DIAS_SEMANA_LECTIVOS, ALCANCES_FESTIVO } from '../utiles/calendarioConfig';

export default function ModalCambioTipo({ diaSeleccionado, datosActuales, alCerrar, alGuardar }) {
    const [tipo, setTipo] = useState(datosActuales?.tipo || 'NO_LECTIVO');

    const [formData, setFormData] = useState({
        nombre: datosActuales?.nombre || '',
        alcance: datosActuales?.alcance || 'Universidad',
        convocatoria: datosActuales?.convocatoria || 1,
        sustituye_dia: datosActuales?.sustituye_dia || ''
    });

    const diaSemanaActualInfo = useMemo(() => {
        if (!diaSeleccionado) return null;
        const fecha = new Date(diaSeleccionado);
        let diaNum = fecha.getDay(); 
        if (diaNum === 0) diaNum = 7;
        
        const info = DIAS_SEMANA_LECTIVOS.find(d => d.id === diaNum);
        return info ? info : { id: diaNum, label: (diaNum === 6 ? 'Sábado' : 'Domingo') };
    }, [diaSeleccionado]);

    const manejarGuardar = () => {
        alGuardar({ tipo, ...formData });
    };

    if (!diaSeleccionado) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">
                        Configurar: <span className="text-[#7a1e1e]">{diaSeleccionado}</span>
                    </h3>
                    <button onClick={alCerrar} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Tipo de Día</h4>
                    <div className="grid grid-cols-1 gap-2 mb-6">
                        {Object.values(TIPOS_DIA).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTipo(t.id)}
                                className={`flex items-center p-3 rounded-lg transition-all text-left border ${
                                    tipo === t.id 
                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 shadow-sm' 
                                        : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded mr-3 shadow-sm ${t.id === 'NO_LECTIVO' ? 'border border-slate-300' : ''}`} style={{ backgroundColor: t.color }}></div>
                                <span className={`font-medium ${tipo === t.id ? 'text-indigo-900' : 'text-slate-700'}`}>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {(tipo === 'EXAMEN' || tipo === 'TFG') && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 animate-fade-in">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Convocatoria</label>
                            <select 
                                value={formData.convocatoria}
                                onChange={(e) => setFormData({...formData, convocatoria: parseInt(e.target.value)})}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={1}>1ª Convocatoria</option>
                                <option value={2}>2ª Convocatoria</option>
                            </select>
                        </div>
                    )}

                    {tipo === 'FESTIVO' && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 animate-fade-in space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del festivo</label>
                                <input 
                                    type="text" placeholder="Ej: Navidad, Día de la Hispanidad..."
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alcance</label>
                                <select 
                                    value={formData.alcance}
                                    onChange={(e) => setFormData({...formData, alcance: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {ALCANCES_FESTIVO.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {tipo === 'CAMBIO_DOC' && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 animate-fade-in">
                            <p className="text-sm text-slate-600 mb-3">
                                Este día (<span className="font-bold">{diaSemanaActualInfo?.label}</span>) pasará a tener el horario de:
                            </p>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Día a sustituir</label>
                            <select 
                                value={formData.sustituye_dia}
                                onChange={(e) => setFormData({...formData, sustituye_dia: e.target.value})}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="" disabled>Seleccione un día...</option>
                                {DIAS_SEMANA_LECTIVOS
                                    .filter(d => d.id !== diaSemanaActualInfo?.id) // Ocultamos el día actual
                                    .map(d => <option key={d.id} value={d.id}>{d.label}</option>)
                                }
                            </select>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end gap-3">
                    <button onClick={alCerrar} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                        Cancelar
                    </button>
                    <button onClick={manejarGuardar} className="px-4 py-2 text-sm font-medium text-white bg-[#7a1e1e] hover:bg-[#651818] rounded-md shadow-sm transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}