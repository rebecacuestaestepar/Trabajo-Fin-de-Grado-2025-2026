import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaResponsable } from './useEsquemaResponsable';
import { obtenerDetalleResponsable, actualizarResponsable } from '../../../api/reservas';

export default function EditarResponsable() {
    // IMPORTANTE: Capturamos 'correo' en lugar de 'id' ya que es la clave primaria
    const { correo } = useParams(); 
    const navigate = useNavigate();
    const esquema = useEsquemaResponsable(); 
    
    const [responsableOriginal, setResponsableOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                // Al backend le enviamos el correo para que lo busque
                const data = await obtenerDetalleResponsable(correo);
                setResponsableOriginal(data);
            } catch (error) {
                console.error("Error al cargar el responsable:", error);
            }
        };
        cargarDetalle();
    }, [correo]);

    const manejarActualizar = async (datosModificados) => {
        try {
            await actualizarResponsable(correo, datosModificados);
            navigate('/admin/responsables');
        } catch (error) {
            console.error("Error al actualizar el responsable:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!responsableOriginal) return <div className="p-8 text-center">Cargando datos del responsable...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Responsable: ${responsableOriginal.nombre} ${responsableOriginal.apellidos}`}
            esquema={esquema}
            datosIniciales={responsableOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/responsables"
        />
    );
}