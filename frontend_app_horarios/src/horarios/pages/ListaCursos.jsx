import { useEffect, useState } from "react";
//import { obtenerCursos } from "../../api/docencia";

export default function ListaCursos() {

  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerCursos = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/docencia/cursos/');
                if (response.ok) {
                    const data = await response.json();
                    setCursos(data); // data será el array: ['2023-24', '2024-25']
                } else {
                    console.error("Error en la respuesta del servidor");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        };

        obtenerCursos();
    }, []);

  return (
    <div className="p-4">
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
        <div>
            {cursos.length === 0 ? (
                <p className="text-gray-500">No hay cursos disponibles.</p>
            ) : (
                <ul className="space-y-2">
                    {cursos.map((curso) => (
                        <li key={curso} className="border-b border-gray-200 py-2">
                            <button
                                type="button"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setCursoSeleccionado(curso)}
                            >
                                Seleccionar
                            </button>
                            {curso}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
}
