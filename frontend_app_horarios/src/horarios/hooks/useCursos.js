import { useState, useEffect } from "react";

export function useCursos() {
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerCursos = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/docencia/cursos/');
                if (response.ok) {
                    const data = await response.json();
                    setCursos(data);
                } else {
                    throw new Error("Error en la respuesta del servidor");
                }
            } catch (err) {
                console.error("Error de conexión:", err);
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };

        obtenerCursos();
    }, []);

    return { cursos, cargando, error };
}