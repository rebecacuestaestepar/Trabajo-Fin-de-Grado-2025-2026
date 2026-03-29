// import { generarIntervalos15Mins } from "../../formulario-utiles/tiempo";


// export function SelectHora(props) {
//     const opciones = generarIntervalos15Mins();

//     return (
//         <select
//             {...props}
//             className={[
//                 "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
//                 "shadow-sm outline-none transition appearance-none", 
//                 "focus:border-[#7a1e1e] focus:ring-1 focus:ring-[#7a1e1e]/20",
//                 "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
//                 props.className ?? "",
//             ].join(" ")}
//         >
//             <option value="" disabled hidden>Selecciona una hora</option>
//             {opciones.map((hora) => (
//                 <option key={hora} value={hora}>
//                     {hora}
//                 </option>
//             ))}
//         </select>
//     );
// }

export function SelectHora({ value, onChange, disabled, required, className }) {
  const [hora, minuto] = (value || ":").split(":");

  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutos = ["00", "15", "30", "45"];

  const manejarCambioHora = (e) => {
    const nuevaHora = e.target.value;
    const nuevoMinuto = minuto || "00";
    
    onChange({ target: { value: `${nuevaHora}:${nuevoMinuto}` } });
  };

  const manejarCambioMinuto = (e) => {
    const nuevoMinuto = e.target.value;
    const nuevaHora = hora || "08";
    
    onChange({ target: { value: `${nuevaHora}:${nuevoMinuto}` } });
  };

  const clasesInput = [
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-center",
    "shadow-sm outline-none transition appearance-none",
    "focus:border-[#7a1e1e] focus:ring-1 focus:ring-[#7a1e1e]/20",
    "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <select
        value={hora || ""}
        onChange={manejarCambioHora}
        disabled={disabled}
        required={required}
        className={clasesInput}
      >
        <option value="" disabled hidden>HH</option>
        {horas.map((h) => (
          <option key={`h-${h}`} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-slate-500 font-bold">:</span>

      <select
        value={minuto || ""}
        onChange={manejarCambioMinuto}
        disabled={disabled}
        required={required}
        className={clasesInput}
      >
        <option value="" disabled hidden>MM</option>
        {minutos.map((m) => (
          <option key={`m-${m}`} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}