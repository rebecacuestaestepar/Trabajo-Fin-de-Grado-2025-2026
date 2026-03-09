export default function SeccionMenu({ titulo, abierta, alAlternar, children, level = 0 }) {
  // Definimos colores por profundidad (puedes ajustarlos a tu gusto)
  const bgColors = ["bg-[#7a1e1e]", "bg-[#4a1212]", "bg-[#2d0a0a]"];
  /*const currentBg = bgColors[level] || bgColors[bgColors.length - 1];*/
  const currentBg = bgColors[level] || bgColors[bgColors.length - 1];
  
  const paddingLeft = `${level * 1.5}rem`;

  return (
    <div className={currentBg}>
      <button
        type="button"
        onClick={alAlternar}
        /*style={{ paddingLeft }}*/
        style={{ paddingLeft: level === 0 ? "1rem" : paddingLeft }}
        /*className={`w-full text-left pr-4 py-3 text-sm font-bold uppercase flex items-center justify-between transition-colors ${currentBg} hover:brightness-110 text-white`}*/
        /*className="w-full text-left pr-4 py-3 text-sm font-bold uppercase flex items-center justify-between hover:bg-black/10 transition-colors"*/
        className={`
          w-full text-left pr-4 py-3 text-sm font-bold uppercase 
          flex items-center justify-between transition-all duration-200
          hover:bg-white/5 text-white
          ${abierta ? "shadow-md" : ""}
        `}

      >
        <span className="flex-1">{titulo}</span>
        {/*<span style={{ marginLeft: level === 0 ? "0" : "1rem" }}>{titulo}</span>
        <span className="text-lg leading-none">{abierta ? "−" : "+"}</span>*/}
        <span className={`text-xl transition-transform duration-200 ${abierta ? "rotate-0" : ""}`}>
          {abierta ? "−" : "+"}
        </span>
      </button>

      {abierta && (
        <div className="border-l-4 border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}