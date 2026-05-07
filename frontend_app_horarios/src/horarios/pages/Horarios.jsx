import { useNavigate } from "react-router-dom";

export default function Horarios() {
  const navigate = useNavigate();

  const verCursos = () => {
    navigate("/horarios/cargar/cursos");
  };

  return (
    <div>
    <h1 className="text-xl font-semibold">Horarios</h1>
    <button
      type="button"
      onClick={verCursos}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
        "bg-[#7a1e1e] hover:bg-[#651818]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "mt-4",
      ].join(" ")}>
        Cargar Nuevo Horario
      </button>
    </div>
  );
}
