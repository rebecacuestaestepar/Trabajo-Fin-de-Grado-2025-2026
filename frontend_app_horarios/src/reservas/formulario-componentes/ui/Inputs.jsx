export function EntradaTexto(props) {
    return (
        <input
            {...props}
            className={[
                "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ",
                "shadow-sm outline-none transition ",
                "focus:border-[#7a1e1e] focus:ring-1 focus:ring-[#7a1e1e]/20 ",
                "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ",
                props.className ?? "",
            ].join(" ")}
        />
    );
}

export function Selector(props) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function AreaTexto(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}
