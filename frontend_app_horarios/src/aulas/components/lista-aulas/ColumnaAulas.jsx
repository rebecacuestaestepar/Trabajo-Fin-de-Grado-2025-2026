import React from 'react';

export default function ColumnaAulas({ titulo, listaAulas, seleccionadas, alternarAula }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-2">{titulo}</h4>
      <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 h-[500px] overflow-y-auto">
        {listaAulas.map((aula) => {
          const id = String(aula?.id ?? "");
          const nombre = String(aula?.nombre ?? "").trim();
          const marcada = seleccionadas.has(nombre);

          return (
            <li
              key={id}
              className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 hover:bg-slate-50 gap-1"
            >
              <label className="flex items-center gap-3 cursor-pointer select-none w-full">
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() => alternarAula(nombre)}
                  className="rounded border-slate-300 text-[#7a1e1e] focus:ring-[#7a1e1e]"
                />
                <span className="text-sm font-medium text-slate-900">
                  {nombre}
                </span>
              </label>

              <div className="text-[10px] text-slate-500 whitespace-nowrap ml-6 sm:ml-0">
                {aula?.edificio ? `Edif. ${aula.edificio}` : ""}
                {aula?.capacidad != null ? ` · Cap ${aula.capacidad}` : ""}
              </div>
            </li>
          );
        })}
        {listaAulas.length === 0 && (
          <li className="p-3 text-sm text-slate-500 text-center italic">No hay aulas en esta categoría</li>
        )}
      </ul>
    </div>
  );
}