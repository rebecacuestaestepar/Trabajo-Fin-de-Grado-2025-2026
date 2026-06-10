import { useState, useEffect } from 'react';
import { listaMiniGrados } from '../../../api/docencia';

export function useEsquemaAsignatura() {
    /*
    * Este hook define el esquema de campos para los formularios de creación y edición de asignaturas.
    */
    const [opcionesGrado, setOpcionesGrado] = useState([]);

    useEffect(() => {
        // Cargar los grados disponibles para el selector del formulario
        const cargarGrados = async () => {
            try {
                const grados = await listaMiniGrados();

                const opcionesFormateadas = grados.map(grado => ({
                    valor: grado.idgrado,
                    texto: `${grado.idgrado} - ${grado.nombre}`
                }));

                setOpcionesGrado(opcionesFormateadas);
            } catch (error) {
                console.error("Error al cargar los grados para el formulario:", error);
            }
        };

        cargarGrados();
    }, []);

    return [
        { llave: 'idasignatura', etiqueta: 'Código Asignatura)', tipo: 'numero', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre de la Asignatura', tipo: 'texto', requerido: true },
        { llave: 'abreviatura', etiqueta: 'Abreviatura', tipo: 'texto' },
        { 
            llave: 'grado_id', 
            etiqueta: 'Grado al que pertenece', 
            tipo: 'selector', 
            requerido: true,
            opciones: opcionesGrado 
        },
        { llave: 'curso_grado', etiqueta: 'Curso', tipo: 'numero', requerido: true },
        { llave: 'semestre_academico', etiqueta: 'Semestre', tipo: 'numero', requerido: true },
        { llave: 'ects', etiqueta: 'Créditos ECTS', tipo: 'numero', requerido: true },
        { 
            llave: 'tipo', 
            etiqueta: 'Tipo de Asignatura', 
            tipo: 'selector', 
            opciones: [
                { valor: 'O', texto: 'Obligatoria' },
                { valor: 'P', texto: 'Optativa' },
            ] 
        },
        { llave: 'horas_practicas', etiqueta: 'Horas Prácticas', tipo: 'numero' }
    ];
}