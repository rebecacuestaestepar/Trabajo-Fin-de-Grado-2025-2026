export default function BarraListado({
  tituloAccionCrear,
  alCrear,


  soloPendientes,
  setSoloPendientes,

  todoVisibleSeleccionado,
  algunoVisibleSeleccionado,
  alAlternarSeleccionarTodoVisible,

  totalFiltradas,
  total,
  cantidadSeleccionadas,
  alLimpiarSeleccion,

  accionesMasivas = [], 

  children
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={() => setSoloPendientes((v) => !v)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition
              ${
                soloPendientes
                  ? "!bg-amber-100 text-amber-900 ring-amber-300 hover:!bg-amber-200"
                  : "!bg-white text-slate-800 ring-slate-200 hover:!bg-slate-50"
              }`}
          >
            {soloPendientes ? "Visualizar Todas" : "Reservas Pendientes"}
          </button>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={todoVisibleSeleccionado}
              ref={(el) => {
                if (el) el.indeterminate = !todoVisibleSeleccionado && algunoVisibleSeleccionado;
              }}
              onChange={alAlternarSeleccionarTodoVisible}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>Seleccionar todas (vista actual)</span>
          </label>

          <span className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{totalFiltradas}</span> /{" "}
            <span className="font-semibold">{total}</span>
            {" · "}
            Seleccionadas:{" "}
            <span className="font-semibold">{cantidadSeleccionadas}</span>
          </span>

          {cantidadSeleccionadas > 0 && (
            <button
              type="button"
              onClick={alLimpiarSeleccion}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Quitar selección
            </button>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 justify-end">
          {tituloAccionCrear && (
            <button
              type="button"
              onClick={alCrear}
              className="rounded-lg !bg-[#7a1e1e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:!bg-[#651818]"
            >
              {tituloAccionCrear}
            </button>
          )}

          <div
            className={`flex flex-wrap gap-2 min-h-[40px] items-center
              ${cantidadSeleccionadas > 0 ? "" : "invisible pointer-events-none"}`}
            aria-hidden={cantidadSeleccionadas === 0}
          >
            {accionesMasivas.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.onClick}
                disabled={b.disabled}
                className={b.className}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
