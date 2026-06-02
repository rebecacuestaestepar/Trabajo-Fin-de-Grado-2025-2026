import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaRol } from './useEsquemaRol';
import { crearRol } from '../../../api/usuarios'; 

export default function CrearRol() {
    const navigate = useNavigate();
    const esquema = useEsquemaRol();

    const manejarGuardar = async (datos) => {
        try {
            await crearRol(datos);
            navigate('/admin/roles'); 
        } catch (error) {
            console.error("Error al crear el rol:", error);
            alert("No se pudo crear el rol. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Rol"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/roles"
        />
    );
}