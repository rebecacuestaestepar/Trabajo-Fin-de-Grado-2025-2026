import React from 'react';
import { EntradaTexto } from '../../reservas/formulario-componentes/ui/Inputs';

/*
* Este componente es un panel de búsqueda que se muestra u oculta según la prop "mostrar".
* Permite al usuario ingresar un término de búsqueda que se propaga al componente padre a través de "alCambiarBusqueda".
* También incluye un botón para limpiar la búsqueda, que llama a "alLimpiar" en el componente padre.
*/
export default function PanelBuscador({ mostrar, busqueda, alCambiarBusqueda, alLimpiar }) {
    return (
        <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out mb-6
            ${mostrar ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 md:items-end gap-4">
                        <div className="md:col-span-12">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Búsqueda global
                            </label>
                            <EntradaTexto 
                                value={busqueda}
                                onChange={(e) => alCambiarBusqueda(e.target.value)}
                                placeholder="Buscar en cualquier campo de la tabla..."
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-4 mt-4">
                        <button
                            onClick={alLimpiar}
                            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}