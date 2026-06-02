import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaGrado } from './useEsquemaGrado';
import { crearGrado } from '../../../api/docencia';

export default function CrearGrado() {
    const navigate = useNavigate();
    const esquema = useEsquemaGrado();

    const manejarGuardar = async (datos) => {
        try {
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