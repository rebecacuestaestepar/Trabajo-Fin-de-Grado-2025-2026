import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaDocente } from './useEsquemaDocente';
import { crearDocente } from '../../../api/docencia';

export default function CrearDocente() {
    const navigate = useNavigate();

    // Obtener el esquema del docente para construir el formulario
    const esquema = useEsquemaDocente();

    const manejarGuardar = async (datos) => {
        try {
            // Llamar a la función de la API para crear el docente
            await crearDocente(datos);
            navigate('/admin/docentes'); 
        } catch (error) {
            console.error("Error al crear el docente:", error);
            alert("No se pudo crear el docente. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Docente"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/docentes"
        />
    );
}