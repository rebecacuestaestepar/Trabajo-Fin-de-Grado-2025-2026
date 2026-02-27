export default function SeccionMenu({ titulo, abierta, alAlternar, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={alAlternar}
        className="w-full text-left px-4 py-3 text-sm font-semibold uppercase hover:bg-[#651818] flex items-center justify-between"
      >
        <span>{titulo}</span>
        <span className="text-lg leading-none">{abierta ? "−" : "+"}</span>
      </button>

      {abierta && <div className="bg-[#361212] indent-8">{children}</div>}
    </div>
  );
}
