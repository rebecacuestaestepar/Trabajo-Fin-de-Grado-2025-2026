// src/components/calendario/ToolbarAulaCalendar.jsx
export default function ToolbarAulaCalendar({
  title,
  onPrev,
  onNext,
  onToday,
  onView,
  view,
  tipo,
  setTipo,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
        >
          ▶
        </button>

        <div className="ml-2 text-sm font-semibold text-slate-800">{title}</div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Mostrar:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-slate-200 px-2 py-1 text-sm"
        >
          <option value="AMBAS">Ambas</option>
          <option value="PUNTUAL">Puntuales</option>
          <option value="PERIODICA">Periódicas</option>
        </select>

        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView("dayGridMonth")}
            className={`rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 ${
              view === "dayGridMonth" ? "bg-slate-100" : ""
            }`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => onView("timeGridWeek")}
            className={`rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 ${
              view === "timeGridWeek" ? "bg-slate-100" : ""
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => onView("timeGridDay")}
            className={`rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 ${
              view === "timeGridDay" ? "bg-slate-100" : ""
            }`}
          >
            Día
          </button>
        </div>
      </div>
    </div>
  );
}
