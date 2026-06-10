import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaDocente } from './useEsquemaDocente';
import { obtenerDetalleDocente, actualizarDocente } from '../../../api/docencia';

export default function EditarDocente() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Obtener el esquema del docente para construir el formulario
    const esquema = useEsquemaDocente(); 
    
    const [docenteOriginal, setDocenteOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                // Cargar los datos actuales del docente para prellenar el formulario
                const data = await obtenerDetalleDocente(id);
                setDocenteOriginal(data);
            } catch (error) {
                console.error("Error al cargar el docente:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            // Llamar a la función de la API para actualizar el docente
            await actualizarDocente(id, datosModificados);
            navigate('/admin/docentes');
        } catch (error) {
            console.error("Error al actualizar el docente:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!docenteOriginal) return <div className="p-8 text-center">Cargando datos del docente...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Docente: ${docenteOriginal.nombre} ${docenteOriginal.apellidos}`}
            esquema={esquema}
            datosIniciales={docenteOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/admin/docentes"
        />
    );
}