export default function PanelFiltros({
  mostrar,

  // toggles
  //usarMotivo,
  //setUsarMotivo,
  //usarResponsable,
  //setUsarResponsable,
  //usarRango,
  //setUsarRango,

  // valores
  filtroMotivo,
  setFiltroMotivo,
  filtroResponsable,
  setFiltroResponsable,
  filtroDesde,
  setFiltroDesde,
  filtroHasta,
  setFiltroHasta,

  alLimpiar,
}) {
  return (
    <div
      className={`mt-4 grid transition-[grid-template-rows,opacity] duration-200 ease-out
        ${mostrar ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="overflow-hidden">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            

            

            <button
              type="button"
              onClick={alLimpiar}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
            <div className="flex-1" />
          </div>

          

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700">
                Motivo
              </label>
              <input
                value={filtroMotivo}
                onChange={(e) => setFiltroMotivo(e.target.value)}
                placeholder="Ej: Curso CSS"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700">
                Responsable (correo)
              </label>
              <input
                value={filtroResponsable}
                onChange={(e) => setFiltroResponsable(e.target.value)}
                placeholder="Ej: juan@..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Desde
              </label>
              <input
                type="date"
                value={filtroDesde}
                onChange={(e) => setFiltroDesde(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Hasta
              </label>
              <input
                type="date"
                value={filtroHasta}
                onChange={(e) => setFiltroHasta(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
