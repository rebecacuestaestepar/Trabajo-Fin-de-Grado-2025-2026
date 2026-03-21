import { Campo } from "../ui/Campo";
import { Selector, EntradaTexto } from "../ui/Inputs";
import { calcularFechasPeriodicas } from "../../formulario-utiles/fechasPeriodicas";

export default function SeccionPeriodicidad({
  formulario,
  alCambiar, 
  permitir = true,
  titulo = "Generar reserva de forma periódica",
}) {
  if (!permitir) return null;

  const cantidad = calcularFechasPeriodicas(
    formulario.fecha_inicio_periodo,
    formulario.fecha_fin_periodo,
    formulario.dia_semana_periodica
  ).length;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={!!formulario.generar_periodica}
            onChange={(e) => alCambiar({ generar_periodica: e.target.checked })}
            className="h-4 w-4 accent-[#7a1e1e]"
          />
          {titulo}
        </label>
        <span className="text-xs text-slate-500">(Opcional)</span>
      </div>

      {formulario.generar_periodica && (
        <div className="mt-4 space-y-4 rounded-md border border-[#7a1e1e]/20 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Configuración de reserva periódica
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta="Fecha inicio">
              <EntradaTexto
                type="date"
                value={formulario.fecha_inicio_periodo || ""}
                onChange={(e) =>
                  alCambiar({ fecha_inicio_periodo: e.target.value })
                }
              />
            </Campo>

            <Campo etiqueta="Fecha fin">
              <EntradaTexto
                type="date"
                value={formulario.fecha_fin_periodo || ""}
                onChange={(e) =>
                  alCambiar({ fecha_fin_periodo: e.target.value })
                }
              />
            </Campo>
          </div>

          <Campo etiqueta="Día de la semana">
            <Selector
              value={formulario.dia_semana_periodica || ""}
              onChange={(e) =>
                alCambiar({ dia_semana_periodica: e.target.value })
              }
            >
              <option value="">Selecciona un día</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
            </Selector>
          </Campo>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            Se generarán{" "}
            <span className="font-semibold text-slate-800">{cantidad}</span>{" "}
            reserva(s) con esta configuración.
          </div>
        </div>
      )}
    </div>
  );
}
