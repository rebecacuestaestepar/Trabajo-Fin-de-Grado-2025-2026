import { useState, useEffect } from 'react';
import { listaMiniDocentes, listaMiniAsignaturas } from '../../../api/docencia';

export function useEsquemaImparte() {

    const [opcionesDocentes, setOpcionesDocentes] = useState([]);
    const [opcionesAsignaturas, setOpcionesAsignaturas] = useState([]);

    useEffect(() => {
        listaMiniDocentes().then(data => {
            console.log("Datos recibidos de mini-docentes:", data);
            const arrayReal = Array.isArray(data) ? data : [];
            const docentesFormateados = arrayReal.map(docente => ({
                valor: docente.codigo,
                texto: `${docente.nombre} ${docente.apellidos}`
            }));

            console.log("Docentes formateados para selector:", docentesFormateados);
            setOpcionesDocentes(docentesFormateados);
        }).catch(err => console.error("Error al cargar docentes:", err));

        listaMiniAsignaturas().then(data => {
            console.log("Datos recibidos de mini-asignaturas:", data);
            const arrayReal = Array.isArray(data) ? data : [];
            const asignaturasFormateadas = arrayReal.map(asig => ({
                valor: asig.idasignatura,
                texto: `${asig.grado_abreviatura} - ${asig.nombre}`
            }));

            console.log("Asignaturas formateadas para selector:", asignaturasFormateadas);
            setOpcionesAsignaturas(asignaturasFormateadas);
        }).catch(err => console.error("Error al cargar asignaturas:", err));
    }, []);

    return [
        { llave: 'codigo_docente', etiqueta: 'Docente', tipo: 'selector', requerido: true, opciones: opcionesDocentes },
        { llave: 'id_asignatura', etiqueta: 'Asignatura', tipo: 'selector', requerido: true, opciones: opcionesAsignaturas },
    ];
}