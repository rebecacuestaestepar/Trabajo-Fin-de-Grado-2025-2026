export default function IconoBool({ valor, etiqueta, iconoVerdadero, iconoFalso = "—" }) {
  const ok = !!valor;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
      ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"
      }`}
      title={etiqueta}
    >
      <span className="text-sm">{ok ? iconoVerdadero : iconoFalso}</span>
      <span className="hidden sm:inline">{etiqueta}</span>
    </span>
  );
}
