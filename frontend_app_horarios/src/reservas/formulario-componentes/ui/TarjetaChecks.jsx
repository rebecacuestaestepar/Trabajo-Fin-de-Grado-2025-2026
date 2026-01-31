export default function TarjetaChecks({ marcado, alCambiar, etiqueta, deshabilitado }) {
    return (
    <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={marcado}
        onChange={alCambiar}
        disabled={deshabilitado}
        className="h-4 w-4 accent-[#7a1e1e] disabled:cursor-not-allowed"
      />
      <span className={deshabilitado ? "text-slate-500" : ""}>{etiqueta}</span>
    </label>
  );
}