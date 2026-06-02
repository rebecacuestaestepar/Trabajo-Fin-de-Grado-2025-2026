import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaDocentes, eliminarDocente } from '../../api/docencia'; 

export default function GestionDocentes() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'codigo', etiqueta: 'Código / DNI' },
        { llave: 'nombre', etiqueta: 'Nombre' },
        { llave: 'apellidos', etiqueta: 'Apellidos' },
        { llave: 'correo', etiqueta: 'Correo' },
        { llave: 'telefono', etiqueta: 'Teléfono' }
    ];

    const [docentes, setDocentes] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await listaDocentes(); 
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setDocentes(datosReales);
            } catch (error) {
                console.error("Error al obtener docentes:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (docente) => {
        navigate(`/admin/docentes/editar/${docente.codigo}`);
    };

    const manejarEliminar = async (docente) => {
        if (window.confirm(`¿Seguro que deseas eliminar al docente ${docente.nombre} ${docente.apellidos}?`)) {
            try {
                await eliminarDocente(docente.codigo);
                setDocentes(docentes.filter(d => d.codigo !== docente.codigo));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el docente.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Docentes"
            columnas={columnas}
            datos={docentes}
            rutaCrear="/admin/docentes/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
            onDescargarPlantilla={() => console.log("Descargar Plantilla")}
            onImportar={(archivo) => console.log("Importar", archivo.name)}
        />
    );
}