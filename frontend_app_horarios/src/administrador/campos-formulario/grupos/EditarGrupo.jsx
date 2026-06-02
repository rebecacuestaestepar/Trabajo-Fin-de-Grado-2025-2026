import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaGrupo } from './useEsquemaGrupo';
import { obtenerDetalleGrupo, actualizarGrupo } from '../../../api/docencia';

export default function EditarGrupo() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const esquema = useEsquemaGrupo(); 
    
    const [grupoOriginal, setGrupoOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await obtenerDetalleGrupo(id);
                setGrupoOriginal(data);
            } catch (error) {
                console.error("Error al cargar el grupo:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            await actualizarGrupo(id, datosModificados);
            navigate('/admin/grupos');
        } catch (error) {
            console.error("Error al actualizar el grupo:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!grupoOriginal) return <div className="p-8 text-center">Cargando datos del grupo...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Grupo: ${grupoOriginal.nombre || grupoOriginal.grupoid}`}
            esquema={esquema}
            datosIniciales={grupoOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/grupos"
        />
    );
}