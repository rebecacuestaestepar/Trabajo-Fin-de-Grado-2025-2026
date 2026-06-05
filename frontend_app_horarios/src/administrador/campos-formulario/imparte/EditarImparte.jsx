import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioDinamico from '../../paginas/Formulario';
import { useEsquemaImparte } from './useEsquemaImparte';
import { obtenerDetalleImparte, actualizarImparte } from '../../../api/docencia';

export default function EditarImparte() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const esquema = useEsquemaImparte();

    const [imparteOriginal, setImparteOriginal] = useState(null);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await obtenerDetalleImparte(id);
                setImparteOriginal(data);
            } catch (error) {
                console.error("Error al cargar la asignación de imparte:", error);
            }
        };
        cargarDetalle();
    }, [id]);

    const manejarActualizar = async (datosModificados) => {
        try {
            await actualizarImparte(id, datosModificados);
            navigate('/administrador/imparte');
        } catch (error) {
            console.error("Error al actualizar la asignación de imparte:", error);
            alert("No se pudo actualizar. Revisa la consola.");
        }
    };

    if (!imparteOriginal) return <div className="p-8 text-center">Cargando datos de la asignación de imparte...</div>;

    return (
        <FormularioDinamico 
            titulo={`Editar Asignación de Docente a Asignatura`}
            esquema={esquema}
            datosIniciales={imparteOriginal} 
            alGuardar={manejarActualizar}
            rutaVolver="/administrador/imparte"
        />
    );

}