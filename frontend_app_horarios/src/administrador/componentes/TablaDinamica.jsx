import React from 'react';

export default function TablaDinamica({ columnas, datos, onEditar, onEliminar }) {
    return (
        // El overflow-x-auto permite que si la pantalla de PC es pequeña, se pueda hacer scroll en lugar de solapar
        <div className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
                
                <thead className="hidden md:table-header-group bg-slate-100 text-xs uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                        {columnas.map((col, index) => (
                            <th key={index} className="px-6 py-4 font-semibold whitespace-nowrap">
                                {col.etiqueta}
                            </th>
                        ))}
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acciones</th>
                    </tr>
                </thead>

                <tbody className="block md:table-row-group">
                    {datos.length > 0 ? (
                        datos.map((fila, index) => {
                            const claveUnica = fila.id || fila.idasignatura || fila.idgrado || fila.codigo || fila.grupoid || index;

                            return (

                                <tr key={claveUnica} 
                                    className="block md:table-row bg-white hover:bg-slate-50 transition-colors group mb-4 md:mb-0 border border-slate-200 md:border-0 md:border-b rounded-xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none"
                                >
                                    {columnas.map((col, colIndex) => {
                                        const esClavePrincipal = col.llave === 'id' || col.llave === 'idasignatura' || col.llave === 'idgrado' || col.llave === 'codigo' || col.llave === 'grupoid';
                                        
                                        return (
                                            <td key={colIndex} className="block md:table-cell px-2 py-2 md:px-6 md:py-4 align-middle">
                                                
                                                <span className="md:hidden text-xs font-semibold uppercase text-slate-400 block mb-1">
                                                    {col.etiqueta}
                                                </span>
                                                
                                                <span className={`${esClavePrincipal ? 'font-bold text-slate-900 text-base md:text-sm' : 'text-slate-600'}`}>
                                                    {fila[col.llave]}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    
                                    <td className="block md:table-cell px-2 py-4 md:px-6 md:py-4 text-right text-sm font-medium mt-2 md:mt-0 border-t border-slate-100 md:border-0 align-middle">
                                        <div className="flex justify-end gap-4 md:block">
                                            <button 
                                                onClick={() => onEditar(fila)}
                                                className="text-blue-600 hover:text-blue-900 md:mr-4 opacity-80 hover:opacity-100 transition-opacity"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => onEliminar(fila)}
                                                className="text-red-600 hover:text-red-900 opacity-80 hover:opacity-100 transition-opacity"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr className="block md:table-row">
                            <td colSpan={columnas.length + 1} className="block md:table-cell px-6 py-12 text-center text-slate-500 border border-slate-200 md:border-none rounded-xl md:rounded-none bg-slate-50 md:bg-transparent">
                                No se han encontrado resultados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}