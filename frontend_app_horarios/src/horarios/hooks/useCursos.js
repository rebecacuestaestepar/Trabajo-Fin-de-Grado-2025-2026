import { useState, useEffect } from "react";
import { obtenerCursos } from "../../api/calendario";

export function useCursos() {
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
        const cargarCursos = async () => {
            setCargando(true);
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
    }, [trigger]);

    const recargarCursos = () => {
        setTrigger(prev => prev + 1); 
    }

    return { cursos, cargando, error, recargarCursos };
}