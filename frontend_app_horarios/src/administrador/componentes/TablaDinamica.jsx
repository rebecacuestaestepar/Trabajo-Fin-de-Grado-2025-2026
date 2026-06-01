import React from 'react';

export default function TablaDinamica({ columnas, datos, onEditar, onEliminar }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                        {columnas.map((col, index) => (
                            <th key={index} className="px-6 py-4 font-semibold">
                                {col.etiqueta}
                            </th>
                        ))}
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {datos.length > 0 ? (
                        datos.map((fila, index) => {
                            
                            const claveUnica = fila.id || fila.idasignatura || fila.idgrado || fila.codigo || fila.grupoid ||index;

                            return (
                                <tr key={claveUnica} className="hover:bg-slate-50 transition-colors group">
                                    {columnas.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                            {col.llave === 'id' || col.llave === 'idasignatura' || col.llave === 'idgrado' || col.llave === 'codigo' || col.llave === 'grupoid' ? (
                                                <span className="font-bold text-slate-900">{fila[col.llave]}</span>
                                            ) : (
                                                fila[col.llave]
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => onEditar(fila)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => onEliminar(fila)}
                                            className="text-red-600 hover:text-red-900 opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columnas.length + 1} className="px-6 py-12 text-center text-slate-500">
                                No se han encontrado resultados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}