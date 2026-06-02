import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaRol } from './useEsquemaRol';
import { obtenerDetalleRol, actualizarRol } from '../../../api/usuarios';

export default function EditarRol() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const esquema = useEsquemaRol(); 
    
    const [rolOriginal, setRolOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await obtenerDetalleRol(id);
                setRolOriginal(data);
            } catch (error) {
                console.error("Error al cargar el rol:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            await actualizarRol(id, datosModificados);
            navigate('/admin/roles');
        } catch (error) {
            console.error("Error al actualizar el rol:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!rolOriginal) return <div className="p-8 text-center">Cargando datos del rol...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Rol: ${rolOriginal.name}`}
            esquema={esquema}
            datosIniciales={rolOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/roles"
        />
    );
}