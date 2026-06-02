import React, { useState, useEffect } from 'react';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaAulas, eliminarAula } from '../../api/aulas'; // Simulando la llamada a tu API para obtener aulas
import { useNavigate } from 'react-router-dom';

export default function GestionAulas() {
    const navigate = useNavigate();
    const columnasAulas = [
        { llave: 'id', etiqueta: 'ID' },
        { llave: 'nombre', etiqueta: 'Aula' },
        { llave: 'edificio', etiqueta: 'Edificio' },
        { llave: 'capacidad', etiqueta: 'Capacidad' },
        { llave: 'campus_formateado', etiqueta: 'Campus' },
    ];

    const [aulas, setAulas] = useState([]);

    useEffect(() => {
        const cargarAulas = async () => {
            try {
                const data = await listaAulas(); 

                console.log("Datos crudos recibidos de la API:", data);

                let datosReales = [];
                if (Array.isArray(data)) {
                    datosReales = data;
                } else if (data && data.results && Array.isArray(data.results)) {
                    datosReales = data.results;
                } else {
                    console.warn("La respuesta de la API no tiene el formato esperado:", data);
                    datosReales = [];
                }
                
                const aulasFormateadas = datosReales.map(aula => ({
                    ...aula,
                    campus_formateado: aula.campus_formateado || (aula.campus === 'V' ? 'Río Vena' : 'Milanera')
                }));
                
                setAulas(aulasFormateadas);
            } catch (error) {
                console.error("Error al obtener las aulas desde el servidor:", error);
            }
        };

        cargarAulas();
    }, []);

    const manejarEditar = (aula) => {
        navigate(`/admin/aulas/editar/${aula.id}`);
    };

    const manejarEliminar = async (aula) => {
        await eliminarAula(aula.id);
    };

    const manejarExportar = () => {
        console.log("Descargar datos aulas");
    };

    const manejarDescargarPlantilla = () => {
        console.log("Descargar plantilla aulas");
    };

    const manejarImportar = (archivoExcel) => {
        console.log("Archivo seleccionado por el usuario:", archivoExcel.name);
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Aulas"
            columnas={columnasAulas}
            datos={aulas}
            rutaCrear="/admin/aulas/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={manejarExportar}
            onDescargarPlantilla={manejarDescargarPlantilla}
            onImportar={manejarImportar}
        />
    );
}