import { useState, useEffect } from 'react';
import { listaMiniAsignaturas } from '../../../api/docencia';
import { listaMiniAulas } from '../../../api/aulas';

export function useEsquemaGrupo() {
    const [opcionesAsig, setOpcionesAsig] = useState([]);
    const [opcionesAula, setOpcionesAula] = useState([]);

    useEffect(() => {
        listaMiniAsignaturas().then(asignaturas => {
            const opcionesFormateadas = asignaturas.map(asig => ({
                valor: asig.idasignatura,
                texto: `${asig.idasignatura} - ${asig.nombre}`
            }));
            setOpcionesAsig(opcionesFormateadas);
        });

        listaMiniAulas().then(aulas => {
            const opcionesFormateadas = aulas.map(aula => ({
                valor: aula.id,
                texto: `${aula.nombre}`
            }));
            setOpcionesAula(opcionesFormateadas);
        });
    }, []);

    return [
        { llave: 'nombre', etiqueta: 'Nombre del Grupo', tipo: 'texto' },
        { 
            llave: 'id_asignatura',
            etiqueta: 'Asignatura', 
            tipo: 'selector', 
            requerido: true,
            opciones: opcionesAsig 
        },
        { 
            llave: 'id_aula',
            etiqueta: 'Aula Asignada', 
            tipo: 'selector', 
            opciones: opcionesAula 
        }
    ];
}