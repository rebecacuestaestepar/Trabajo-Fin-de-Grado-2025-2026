import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaAsignaturas, eliminarAsignatura } from '../../api/docencia';

export default function GestionAsignaturas() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'idasignatura', etiqueta: 'Código' },
        { llave: 'nombre', etiqueta: 'Asignatura' },
        { llave: 'curso_grado', etiqueta: 'Curso' },
        { llave: 'semestre_academico', etiqueta: 'Semestre' },
        { llave: 'ects', etiqueta: 'ECTS' },
        { llave: 'tipo_formateado', etiqueta: 'Tipo' },
        { llave: 'grado_nombre', etiqueta: 'Grado' }
    ];

    const [asignaturas, setAsignaturas] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await listaAsignaturas(); 

                console.log("Datos recibidos de la API:", data);
                
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                const datosFormateados = datosReales.map(asig => ({
                    ...asig,
                    tipo_formateado: asig.tipo_formateado || (asig.tipo === 'O' ? 'Obligatoria' : asig.tipo === 'P' ? 'Optativa': asig.tipo)
                }));
                
                setAsignaturas(datosFormateados);
            } catch (error) {
                console.error("Error al obtener asignaturas:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (asignatura) => {
        navigate(`/admin/asignaturas/editar/${asignatura.idasignatura}`);
    };

    const manejarEliminar = async (asignatura) => {
        if (window.confirm(`¿Seguro que deseas eliminar la asignatura ${asignatura.nombre}?`)) {
            try {
                await eliminarAsignatura(asignatura.idasignatura);
                setAsignaturas(asignaturas.filter(a => a.idasignatura !== asignatura.idasignatura));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar la asignatura.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Asignaturas"
            columnas={columnas}
            datos={asignaturas}
            rutaCrear="/admin/asignaturas/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
            onDescargarPlantilla={() => console.log("Plantilla Excel")}
            onImportar={(archivo) => console.log("Importar", archivo.name)}
        />
    );
}