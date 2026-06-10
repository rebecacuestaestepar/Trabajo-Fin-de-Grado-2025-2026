import { Campo } from "../ui/Campo";
import { Selector } from "../ui/Inputs";

export default function SeccionSelectorAula({
  titulo = "Aula candidata",
  alBuscarAulas,
  estaBuscando,
  puedeBuscar,

  modo, 
  aulasDisponibles = [],
  aulaSeleccionada = "",
  alSeleccionarAula,
  
  fechas = [],
  aulasPorFecha = {},
  seleccionPorFecha = {},
  alSeleccionarPorFecha,

}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{titulo}</h2>

        <button
          type="button"
          onClick={alBuscarAulas}
          disabled={estaBuscando || !puedeBuscar}
          className={[
            "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
            "bg-white text-[#7a1e1e] ring-1 ring-[#7a1e1e]/50 hover:bg-[#7a1e1e]/5",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {estaBuscando ? "Buscando aulas..." : "Buscar aulas candidatas"}
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {(modo === "simple" || modo === "comun") && (
          <Campo
            etiqueta="Aula"
            pista={
              aulasDisponibles.length > 0
                ? "Por defecto se selecciona la primera aula disponible. Puedes escoger otra."
                : 'Pulsa "Buscar aulas candidatas" para cargar opciones.'
            }
          >
            {aulasDisponibles.length > 0 ? (
              <Selector
                value={aulaSeleccionada}
                onChange={(e) => {
                  const nombreSeleccionado = e.target.value;
                  const aulaObjeto = aulasDisponibles.find((a) => a.nombre === nombreSeleccionado);
                  if (aulaObjeto) {
                    alSeleccionarAula(aulaObjeto.nombre);
                  }
                }}
              >
                {aulasDisponibles.map((a) => (
                  <option key={a.id || a.nombre} value={a.nombre}>
                    {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                  </option>
                ))}
              </Selector>
            ) : (
              <Selector value="" disabled>
                <option value="">
                  (No existen aulas disponibles para los criterios seleccionados)
                </option>
              </Selector>
            )}
          </Campo>
        )}

        {modo === "por_fecha" && (
          <div className="space-y-3">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No existe un aula libre para <b>todas</b> las fechas. Selecciona un
              aula para cada fecha.
            </div>

            {fechas.map((fecha) => {
              const lista = aulasPorFecha[fecha] || [];
              const valor = seleccionPorFecha[fecha] || "";

              return (
                <div
                  key={fecha}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 text-xs font-semibold text-slate-700">
                    Fecha: {fecha}
                  </div>

                  <Selector
                    value={valor}
                    onChange={(e) => alSeleccionarPorFecha(fecha, e.target.value)}
                    disabled={lista.length === 0}
                  >
                    {lista.length === 0 ? (
                      <option value="">(Sin aulas disponibles en esta fecha)</option>
                    ) : (
                      lista.map((a) => (
                        <option key={a.nombre} value={a.nombre}>
                          {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                        </option>
                      ))
                    )}
                  </Selector>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
