import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAulas } from "../../general/hooks/useAulas";
import ColumnaAulas from "../components/lista-aulas/ColumnaAulas";

export default function OcupacionAulas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { aulas, cargando, error } = useAulas();


  const [seleccionadas, setSeleccionadas] = useState(() => new Set());


  const { aulasEstandar, laboratorios, otros } = useMemo(() => {
    const arr = Array.isArray(aulas) ? [...aulas] : [];
    arr.sort((a, b) => String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? "")));

    const regexAulaEstandar = /^[1-9][1-9]-A[1-9]$/i;
    
    const catAulas = [];
    const catLabs = [];
    const catOtros = [];

    arr.forEach((aula) => {
      const nombre = String(aula?.nombre ?? "").trim();
      if (!nombre) return;

      if (regexAulaEstandar.test(nombre)) {
        catAulas.push(aula);
      } else if (nombre.toLowerCase().includes("lab")) {
        catLabs.push(aula);
      } else {
        catOtros.push(aula);
      }
    });

    return {
      aulasEstandar: catAulas,
      laboratorios: catLabs,
      otros: catOtros,
    };
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
      <div className="flex items-center justify-between">
          <div>
          <h1 className="text-2xl font-bold text-slate-900">Ocupación de aulas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Selecciona una o varias aulas para ver su ocupación.
          </p>
        </div>
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

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <h3 className="font-bold">Lista de aulas campus</h3>
        </div>
        
        <div className="mt-4">
          {cargando && <div className="text-sm text-slate-600">Cargando aulas…</div>}
          {error && <div className="text-sm text-rose-700">Error: {error}</div>}

          {!cargando && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ColumnaAulas 
              titulo="Aulas de Teoría" 
              listaAulas={aulasEstandar} 
              seleccionadas={seleccionadas}
              alternarAula={alternarAula}
            />
            <ColumnaAulas 
              titulo="Laboratorios" 
              listaAulas={laboratorios} 
              seleccionadas={seleccionadas}
              alternarAula={alternarAula}
            />
            <ColumnaAulas 
              titulo="Otras Aulas" 
              listaAulas={otros} 
              seleccionadas={seleccionadas}
              alternarAula={alternarAula}
            />
          </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
