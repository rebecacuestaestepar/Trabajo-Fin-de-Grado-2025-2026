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

  // variante === "editar"
  const { alRechazar, alAceptar, alGuardar, deshabilitarGuardar } = props;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      {/*}
      <button
        type="button"
        onClick={alRechazar}
        className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold ring-1 ring-rose-300 text-rose-700 hover:bg-rose-50"
      >
        Rechazar
      </button>

      <button
        type="button"
        onClick={alAceptar}
        className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white !bg-[#7a1e1e] hover:bg-[#651818]"
      >
        Aceptar
      </button>*/}

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
