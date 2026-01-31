export function ModalConfirmacion({
  abierto,
  titulo,
  descripcion,
  alCancelar,
  alConfirmar,
  textoConfirmar = "Continuar",
  peligro = false,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={alCancelar} />
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
        <p className="mt-2 text-sm text-slate-600">{descripcion}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={alCancelar}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={alConfirmar}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white",
              peligro
                ? "bg-rose-700 hover:bg-rose-800"
                : "!bg-[#7a1e1e] hover:bg-[#651818]",
            ].join(" ")}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}