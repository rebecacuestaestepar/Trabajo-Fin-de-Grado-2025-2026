import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaGrado } from './useEsquemaGrado';
import { obtenerDetalleGrado, actualizarGrado } from '../../../api/docencia';

export default function EditarGrado() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Obtener el esquema del grado para construir el formulario
    const esquema = useEsquemaGrado(); 
    
    const [gradoOriginal, setGradoOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                // Cargar los datos actuales del grado para prellenar el formulario
                const data = await obtenerDetalleGrado(id);
                setGradoOriginal(data);
            } catch (error) {
                console.error("Error al cargar el grado:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            // Llamar a la función de la API para actualizar el grado
            await actualizarGrado(id, datosModificados);
            navigate('/admin/grados');
        } catch (error) {
            console.error("Error al actualizar el grado:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!gradoOriginal) return <div className="p-8 text-center">Cargando datos del grado...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Grado: ${gradoOriginal.nombre}`}
            esquema={esquema}
            datosIniciales={gradoOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/grados"
        />
    );
}