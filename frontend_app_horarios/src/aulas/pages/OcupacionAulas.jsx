// src/paginas/OcupacionAulas.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAulas } from "../../general/hooks/useAulas";

export default function OcupacionAulas() {
  const navigate = useNavigate();
  const { aulas, cargando, error } = useAulas();

  // "multiple" | "unica"
  const [modoSeleccion, setModoSeleccion] = useState("multiple");
  const [seleccionadas, setSeleccionadas] = useState(() => new Set());

  const listaOrdenada = useMemo(() => {
    const arr = Array.isArray(aulas) ? [...aulas] : [];
    arr.sort((a, b) => String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? "")));
    return arr;
  }, [aulas]);

  function alternarAula(nombre) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev);

      if (modoSeleccion === "unica") {
        // si es única, dejamos solo esa (o ninguna si se desmarca)
        if (nuevo.has(nombre)) return new Set();
        return new Set([nombre]);
      }

      // múltiple
      if (nuevo.has(nombre)) nuevo.delete(nombre);
      else nuevo.add(nombre);

      return nuevo;
    });
  }

  function verOcupacion() {
    const nombres = Array.from(seleccionadas);
    if (nombres.length === 0) return;

    // Pasamos la selección por querystring: ?aulas=A-01& aULAS=...
    const params = new URLSearchParams();
    nombres.forEach((n) => params.append("aula", n));

    navigate(`/aulas/ocupacion/ver?${params.toString()}`);
  }

  const totalSeleccionadas = seleccionadas.size;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Ocupación de aulas</h1>
      <p className="mt-1 text-sm text-slate-600">
        Selecciona una o varias aulas para ver su ocupación.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800">Modo:</span>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="modo"
                value="multiple"
                checked={modoSeleccion === "multiple"}
                onChange={() => {
                  setModoSeleccion("multiple");
                  // no tocamos selección actual
                }}
              />
              Múltiple
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="modo"
                value="unica"
                checked={modoSeleccion === "unica"}
                onChange={() => {
                  setModoSeleccion("unica");
                  // si al cambiar hay más de 1 seleccionada, nos quedamos con la primera
                  setSeleccionadas((prev) => {
                    const arr = Array.from(prev);
                    return arr.length ? new Set([arr[0]]) : new Set();
                  });
                }}
              />
              Única
            </label>
          </div>

          <button
            type="button"
            onClick={verOcupacion}
            disabled={totalSeleccionadas === 0}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
              "bg-[#7a1e1e] hover:bg-[#651818]",
              "disabled:cursor-not-allowed disabled:opacity-50",
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
                const nombre = String(aula?.nombre ?? "").trim();
                if (!nombre) return null;

                const marcada = seleccionadas.has(nombre);

                return (
                  <li
                    key={nombre}
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

                    {/* Info extra si quieres mostrar edificio/capacidad */}
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
