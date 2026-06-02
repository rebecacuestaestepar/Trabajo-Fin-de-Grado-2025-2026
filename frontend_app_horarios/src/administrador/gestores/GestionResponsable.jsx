import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerResponsables, eliminarResponsable } from '../../api/reservas'; 

export default function GestionResponsables() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'correo', etiqueta: 'Correo Electrónico' },
        { llave: 'nombre', etiqueta: 'Nombre' },
        { llave: 'apellidos', etiqueta: 'Apellidos' },
        { llave: 'telefono', etiqueta: 'Teléfono' },
        { llave: 'codigo_docente', etiqueta: 'Cód. Docente' }
    ];

    const [responsables, setResponsables] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await obtenerResponsables(); 
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setResponsables(datosReales);
            } catch (error) {
                console.error("Error al obtener responsables:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (responsable) => {
        navigate(`/admin/responsables/editar/${responsable.correo}`);
    };

    const manejarEliminar = async (responsable) => {
        if (window.confirm(`¿Seguro que deseas eliminar al responsable ${responsable.nombre}?`)) {
            try {
                await eliminarResponsable(responsable.correo);
                setResponsables(responsables.filter(r => r.correo !== responsable.correo));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar al responsable.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Responsables"
            columnas={columnas}
            datos={responsables}
            rutaCrear="/admin/responsables/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
        />
    );
}