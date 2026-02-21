// src/aulas/components/calendario/LeyendaAulas.jsx

export default function LeyendaAulas({ mapaColores = {} }) {
  const aulasSeleccionadas = Object.keys(mapaColores);
  
  if (aulasSeleccionadas.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        Leyenda de colores por aula:
      </span>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {aulasSeleccionadas.map((aula) => {
          const { oscuro, claro } = mapaColores[aula];
          return (
            <div key={aula} className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{aula}:</span>
              
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span 
                  className="inline-block h-3 w-3 rounded-sm shadow-sm" 
                  style={{ background: oscuro }} 
                />
                Puntuales
              </div>
              
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span 
                  className="inline-block h-3 w-3 rounded-sm shadow-sm" 
                  style={{ background: claro }} 
                />
                Periódicas
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}