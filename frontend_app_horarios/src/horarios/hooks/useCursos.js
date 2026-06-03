import { useState, useEffect } from "react";
import { obtenerCursos } from "../../api/calendario";

export function useCursos() {
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarCursos = async () => {
            try {
                const data = await obtenerCursos(); 
                
                setCursos(data); 

            } catch (err) {
                console.error("Error de conexión:", err);
                setError(err.message || "Error al cargar los cursos");
            } finally {
                setCargando(false);
            }
        };

        cargarCursos();
    }, []);

    return { cursos, cargando, error };
}