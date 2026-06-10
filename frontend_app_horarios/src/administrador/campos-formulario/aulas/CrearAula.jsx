import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaAula } from './useEsquemaAula';
import { crearAula } from '../../../api/aulas';

export default function CrearAula() {
    const navigate = useNavigate();

    // Obtener el esquema del aula para construir el formulario
    const esquema = useEsquemaAula();

    const manejarGuardar = async (datos) => {
        try {
            // Llamar a la función de la API para crear el aula
            await crearAula(datos);
            navigate('/admin/aulas'); 
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    return (
        <FormularioDinamico 
            titulo="Crear Nueva Aula"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/aulas"
        />
    );
}