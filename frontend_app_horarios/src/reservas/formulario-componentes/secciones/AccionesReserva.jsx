export default function AccionesReserva({ variante, ...props }) {
  if (variante === "solicitud") {
    const { alEnviar, deshabilitado } = props;

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          onClick={alEnviar}
          disabled={deshabilitado}
          className={[
            "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
            "!bg-[#7a1e1e] hover:bg-[#651818] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e]/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          Enviar solicitud
        </button>
      </div>
    );
  }
  const { alGuardar, deshabilitarGuardar, alEliminar } = props;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

      {variante === "editar" && (
        <button
          type="button"
          onClick={alEliminar}
          className={[
            "inline-flex items-center justify-center rounded-md border border-red-600 px-5 py-2.5 text-sm font-semibold text-red-600 transition",
            "hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/30",
          ].join(" ")}
        >
          Eliminar reserva
        </button>
      )}

      <button
        type="button"
        onClick={alGuardar}
        disabled={deshabilitarGuardar}
        className={[
          "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white transition",
          "!bg-slate-700 hover:bg-slate-800",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        Guardar cambios
      </button>
    </div>
  );
}
