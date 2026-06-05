import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaImparte } from './useEsquemaImparte';
import { crearImparte } from '../../../api/docencia';

export default function CrearImparte() {
    const navigate = useNavigate();
    const esquema = useEsquemaImparte();

    const manejarGuardar = async (datos) => {
        try {
            await crearImparte(datos);
            navigate('/administrador/imparte');
        } catch (error) {
            console.error('Error al crear imparte:', error);
        }
    };

    return (
        <FormularioDinamico 
            titulo="Añadir Nueva Asignación de Docente a Asignatura"
            esquema={esquema}
            alGuardar={manejarGuardar}
            rutaVolver="/administrador/imparte"
        />
    );

}