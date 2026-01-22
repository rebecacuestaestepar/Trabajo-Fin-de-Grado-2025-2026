// src/components/ReservaFormTemplate.jsx
export default function ReservaFormTemplate({
  title,
  onBack, // si existe, muestra botón Volver
  children,
  footer, // botones abajo
  mensaje,
  errores,
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-[#7a1e1e]/60 bg-white shadow-sm">
          <div className="border-b border-[#7a1e1e]/30 px-6 py-5">
            <div className="flex items-center justify-between">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                >
                  ← Volver
                </button>
              ) : (
                <span />
              )}

              <h1 className="text-center text-lg font-semibold tracking-wide text-slate-900">
                {title}
              </h1>

              <span />
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {children}

            {footer ? <div className="pt-2">{footer}</div> : null}

            {mensaje && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {mensaje}
              </div>
            )}

            {errores && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-800">Errores</p>
                <pre className="mt-2 overflow-auto text-xs text-rose-800">
                  {JSON.stringify(errores, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
