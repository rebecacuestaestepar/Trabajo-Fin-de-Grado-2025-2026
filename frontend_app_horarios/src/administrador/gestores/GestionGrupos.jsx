import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaGrupos, eliminarGrupo } from '../../api/docencia'; 

export default function GestionGrupos() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'grupoid', etiqueta: 'ID' },
        { llave: 'nombre', etiqueta: 'Nombre del Grupo' },
        { llave: 'asignatura_nombre', etiqueta: 'Asignatura' },
        { llave: 'aula_nombre', etiqueta: 'Aula Asignada' }
    ];

    const [grupos, setGrupos] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await listaGrupos(); 
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setGrupos(datosReales);
            } catch (error) {
                console.error("Error al obtener grupos:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (grupo) => {
        navigate(`/admin/grupos/editar/${grupo.grupoid}`);
    };

    const manejarEliminar = async (grupo) => {
        if (window.confirm(`¿Seguro que deseas eliminar el grupo ${grupo.nombre || grupo.grupoid}?`)) {
            try {
                await eliminarGrupo(grupo.grupoid);
                setGrupos(grupos.filter(g => g.grupoid !== grupo.grupoid));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el grupo.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Grupos"
            columnas={columnas}
            datos={grupos}
            rutaCrear="/admin/grupos/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
            onDescargarPlantilla={() => console.log("Descargar Plantilla")}
            onImportar={(archivo) => console.log("Importar", archivo.name)}
        />
    );
}