import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAulas } from "../../general/hooks/useAulas";

export default function OcupacionAulas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { aulas, cargando, error } = useAulas();


  const [seleccionadas, setSeleccionadas] = useState(() => new Set());

  /* Ordena la lista de aulas recibida  */
  const listaOrdenada = useMemo(() => {
    const arr = Array.isArray(aulas) ? [...aulas] : [];
    arr.sort((a, b) => String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? "")));
    console.log("Aulas ordenadas:", arr);
    return arr;
  }, [aulas]);

  const totalSeleccionadas = seleccionadas.size;

  function alternarAula(nombre) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev);
      
      if (nuevo.has(nombre)) nuevo.delete(nombre);
      else nuevo.add(nombre);

      return nuevo;
    });
  }

  function verOcupacion() {
    const nombres = Array.from(seleccionadas);
    if (nombres.length === 0) return;

    const params = new URLSearchParams();
    nombres.forEach((n) => params.append("aula", n));

    const objetosSeleccionados = aulas.filter((aula) => 
      seleccionadas.has(aula.nombre)
    );

    navigate(`/aulas/ocupacion/ver?${params.toString()}`, {
      state: { 
        from: location.pathname + location.search,
        aulasSeleccionadas: objetosSeleccionados,
      },
    });
  }

  

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Ocupación de aulas</h1>
      <p className="mt-1 text-sm text-slate-600">
        Selecciona una o varias aulas para ver su ocupación.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={verOcupacion}
            disabled={totalSeleccionadas === 0}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
              "bg-[#7a1e1e] hover:bg-[#651818]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "mt-4",
            ].join(" ")}
          >
            Ver ocupación ({totalSeleccionadas})
          </button>

        </div>
        
        <div className="mt-4">
          {cargando && <div className="text-sm text-slate-600">Cargando aulas…</div>}
          {error && <div className="text-sm text-rose-700">Error: {error}</div>}

          {!cargando && !error && (
            <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {listaOrdenada.map((aula) => {
                const id = String(aula?.id ?? "");
                const nombre = String(aula?.nombre ?? "").trim();
                if (!nombre) return null;

                const marcada = seleccionadas.has(nombre);

                return (
                  <li
                    key={id}
                    //value={nombre}
                    className="flex items-center justify-between px-3 py-3 hover:bg-slate-50"
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() => alternarAula(nombre)}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {nombre}
                      </span>
                    </label>

                    <div className="text-xs text-slate-500">
                      {aula?.edificio ? `Edif. ${aula.edificio}` : ""}
                      {aula?.capacidad != null ? ` · Cap ${aula.capacidad}` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
      </div>
    </div>
  );
}
