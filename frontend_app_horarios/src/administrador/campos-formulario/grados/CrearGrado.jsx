import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaGrado } from './useEsquemaGrado';
import { crearGrado } from '../../../api/docencia';

export default function CrearGrado() {
    const navigate = useNavigate();

    // Obtener el esquema del grado para construir el formulario
    const esquema = useEsquemaGrado();

    const manejarGuardar = async (datos) => {
        try {
            // Llamar a la función de la API para crear el grado
            await crearGrado(datos);
            navigate('/admin/grados'); 
        } catch (error) {
            console.error("Error al crear el grado:", error);
            alert("No se pudo crear el grado. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Grado"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/grados"
        />
    );
}