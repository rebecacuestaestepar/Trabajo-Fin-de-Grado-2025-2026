import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaGrupo } from './useEsquemaGrupo';
import { crearGrupo } from '../../../api/docencia';

export default function CrearGrupo() {
    const navigate = useNavigate();
    const esquema = useEsquemaGrupo();

    const manejarGuardar = async (datos) => {
        try {
            await crearGrupo(datos);
            navigate('/admin/grupos'); 
        } catch (error) {
            console.error("Error al crear el grupo:", error);
            alert("No se pudo crear el grupo. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Grupo"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/grupos"
        />
    );
}