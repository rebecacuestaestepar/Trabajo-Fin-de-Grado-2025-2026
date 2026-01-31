// Contenedor principal de página
export default function TarjetaPagina({ titulo, izquierda, derecha, children }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-[#7a1e1e]/60 bg-white shadow-sm">
          <div className="border-b border-[#7a1e1e]/30 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>{izquierda}</div>
              <h1 className="text-center text-lg font-semibold tracking-wide text-slate-900">
                {titulo}
              </h1>
              <div>{derecha}</div>
            </div>
          </div>
          <div className="space-y-6 px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}