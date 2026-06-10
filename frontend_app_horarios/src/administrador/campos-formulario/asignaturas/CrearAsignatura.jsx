import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaAsignatura } from './useEsquemaAsignatura';
import { crearAsignatura } from '../../../api/docencia';

export default function CrearAsignatura() {
    const navigate = useNavigate();

    // Obtener el esquema de la asignatura para construir el formulario
    const esquema = useEsquemaAsignatura(); 

    const manejarGuardar = async (datos) => {
        try {
            // Llamar a la función de la API para crear la asignatura
            await crearAsignatura(datos);
            navigate('/admin/asignaturas'); 
        } catch (error) {
            console.error("Error al crear la asignatura:", error);
            alert("No se pudo crear la asignatura. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nueva Asignatura"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/asignaturas"
        />
    );
}