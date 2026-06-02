import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaAula } from './useEsquemaAula';
import { obtenerDetalleAula, actualizarAula } from '../../../api/aulas';

export default function EditarAula() {
    const { id } = useParams();
    const navigate = useNavigate();
    const esquema = useEsquemaAula();
    
    const [aulaOriginal, setAulaOriginal] = useState(null);

    useEffect(() => {
        obtenerDetalleAula(id).then(data => setAulaOriginal(data));
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            await actualizarAula(id, datosModificados);
            navigate('/admin/aulas');
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    if (!aulaOriginal) return <p>Cargando...</p>;

    return (
        <FormularioDinamico 
            titulo={`Editar Aula: ${aulaOriginal.nombre}`}
            esquema={esquema}
            datosIniciales={aulaOriginal}
            alGuardar={manejarActualizar}
            rutaVolver="/admin/aulas"
        />
    );
}