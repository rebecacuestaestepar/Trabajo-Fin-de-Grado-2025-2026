import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaUsuario } from './useEsquemaUsuario';
import { crearUsuario } from '../../../api/usuarios';

export default function CrearUsuario() {
    const navigate = useNavigate();
    const esquema = useEsquemaUsuario();

    const manejarGuardar = async (datos) => {
        try {
            // TRUCO: Django espera que 'groups' sea una lista. Si viene como un número/string, lo metemos en un array.
            const datosAEnviar = { ...datos };
            if (datosAEnviar.groups && !Array.isArray(datosAEnviar.groups)) {
                datosAEnviar.groups = [datosAEnviar.groups];
            }

            await crearUsuario(datosAEnviar);
            navigate('/admin/usuarios'); 
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            alert("No se pudo crear el usuario. Revisa la consola.");
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nuevo Usuario"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/admin/usuarios"
        />
    );
}