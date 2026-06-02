import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaGrados, eliminarGrado } from '../../api/docencia'; 

export default function GestionGrados() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'idgrado', etiqueta: 'Código' },
        { llave: 'nombre', etiqueta: 'Nombre del Grado' },
        { llave: 'abreviatura', etiqueta: 'Abreviatura' },
        { llave: 'coordinador', etiqueta: 'Coordinador' }
    ];

    const [grados, setGrados] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await listaGrados(); 
                console.log("Datos recibidos de la API:", data);
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setGrados(datosReales);
            } catch (error) {
                console.error("Error al obtener grados:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (grado) => {
        navigate(`/admin/grados/editar/${grado.idgrado}`);
    };

    const manejarEliminar = async (grado) => {
        if (window.confirm(`¿Seguro que deseas eliminar el grado ${grado.nombre}?`)) {
            try {
                await eliminarGrado(grado.idgrado);
                setGrados(grados.filter(g => g.idgrado !== grado.idgrado));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el grado.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Grados"
            columnas={columnas}
            datos={grados}
            rutaCrear="/admin/grados/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
            onDescargarPlantilla={() => console.log("Descargar Plantilla")}
            onImportar={(archivo) => console.log("Importar", archivo.name)}
        />
    );
}