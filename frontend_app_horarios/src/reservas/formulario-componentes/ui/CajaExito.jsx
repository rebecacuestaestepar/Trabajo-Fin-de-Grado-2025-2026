export function CajaExito({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {children}
    </div>
  );
}

export function CajaError({ errores }) {
  if (!errores) return null;
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
      <p className="text-sm font-semibold text-rose-800">Errores</p>
      <pre className="mt-2 overflow-auto text-xs text-rose-800">
        {JSON.stringify(errores, null, 2)}
      </pre>
    </div>
  );
}
