export function ModalDatosResponsable({
    abierto,
    correo,
    formulario,
    alCambiar,
    alCancelar,
    alConfirmar,
}) {

    if(!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/40" onClick={alCancelar}/>
            <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <h3 className="text-base font-semibold text-slate-900">
                    Nuevo Responsable
                </h3>
                <p>
                    El correo <strong>{correo}</strong> no esá registrado. Por favor, introduce su nombre y apellidos para continuar la reserva.
                </p>
                <div className="mt-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Nombre
                        </label>
                        <input type="text" 
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#7a1e1e] focus:outline-none focus:ring-1 focus:ring-[#7a1e1e]"
                        value={formulario.nombre_responsable || ""}
                        onChange={(e) => alCambiar({ nombre_responsable: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Apellidos
                        </label>
                        <input type="text" 
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#7a1e1e] focus:outline-none focus:ring-1 focus:ring-[#7a1e1e]"
                        value={formulario.apellidos_responsable || ""}
                        onChange={(e) => alCambiar({ apellidos_responsable: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button onClick={alCancelar}
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button
                    onClick={alConfirmar}
                    disabled={!formulario.nombre_responsable || !formulario.apellidos_responsable}
                    className="inline-flex items-center justify-center rounded-md bg-[#7a1e1e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#651818] disbaled:opacity-50">
                        Guardar y Continuar
                    </button>
                </div>
            </div>
        </div>
    )
}