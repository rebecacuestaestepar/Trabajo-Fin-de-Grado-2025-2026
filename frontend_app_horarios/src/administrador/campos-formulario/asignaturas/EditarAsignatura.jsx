import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaAsignatura } from './useEsquemaAsignatura';
import { obtenerDetalleAsignatura, actualizarAsignatura } from '../../../api/docencia';

export default function EditarAsignatura() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Obtener el esquema de la asignatura para construir el formulario
    const esquema = useEsquemaAsignatura(); 
    
    const [asignaturaOriginal, setAsignaturaOriginal] = useState(null);

    useEffect(() => {
        // Cargar los datos actuales de la asignatura para prellenar el formulario
        const cargarDetalle = async () => {
            try {
                const data = await obtenerDetalleAsignatura(id);
                setAsignaturaOriginal(data);
            } catch (error) {
                console.error("Error al cargar la asignatura:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            // Llamar a la función de la API para actualizar la asignatura
            await actualizarAsignatura(id, datosModificados);
            navigate('/admin/asignaturas');
        } catch (error) {
            console.error("Error al actualizar la asignatura:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!asignaturaOriginal) return <div className="p-8 text-center">Cargando datos de la asignatura...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Asignatura: ${asignaturaOriginal.nombre}`}
            esquema={esquema}
            datosIniciales={asignaturaOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/asignaturas"
        />
    );
}