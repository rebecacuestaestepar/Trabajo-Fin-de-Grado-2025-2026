export default function ListaCursos() {
  return (
    <div className="sm:space-between">
      <h1 className="text-xl font-semibold">Lista de Cursos Disponibles</h1>
      <button
        type="button"
        className={[
            "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
            "bg-[#7a1e1e] hover:bg-[#651818]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "mt-4",
        ].join(" ")}>
        Cargar Nuevo Curso
      </button>
    </div>
  );
}
