import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaUsuario } from './useEsquemaUsuario';
import { obtenerDetalleUsuario, actualizarUsuario } from '../../../api/usuarios';

export default function EditarUsuario() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const esquema = useEsquemaUsuario(); 
    
    const [usuarioOriginal, setUsuarioOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await obtenerDetalleUsuario(id);
                // Si el usuario tiene roles, DRF nos devuelve un array. Extraemos el primer ID para el selector simple.
                if (data.groups && data.groups.length > 0) {
                    data.groups = data.groups[0]; 
                }
                setUsuarioOriginal(data);
            } catch (error) {
                console.error("Error al cargar el usuario:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            const datosAEnviar = { ...datosModificados };
            if (datosAEnviar.groups && !Array.isArray(datosAEnviar.groups)) {
                datosAEnviar.groups = [datosAEnviar.groups];
            }

            await actualizarUsuario(id, datosAEnviar);
            navigate('/admin/usuarios');
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!usuarioOriginal) return <div className="p-8 text-center">Cargando datos del usuario...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Usuario: ${usuarioOriginal.username}`}
            esquema={esquema}
            datosIniciales={usuarioOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/usuarios"
        />
    );
}