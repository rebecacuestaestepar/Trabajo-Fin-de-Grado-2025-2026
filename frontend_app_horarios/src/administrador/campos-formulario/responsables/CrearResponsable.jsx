import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaResponsable } from './useEsquemaResponsable';
import { crearResponsable } from '../../../api/reservas';

export default function CrearResponsable() {
    const navigate = useNavigate();
    const esquema = useEsquemaResponsable();

    const manejarGuardar = async (datos) => {
        try {
            await crearResponsable(datos);
            navigate('/admin/responsables'); 
        } catch (error) {
            console.error("Error al crear el responsable:", error);
            alert("No se pudo crear el responsable. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Responsable"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/responsables"
        />
    );
}