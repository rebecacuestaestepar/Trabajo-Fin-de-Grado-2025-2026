import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaAsignaturas, eliminarAsignatura } from '../../api/docencia';

import { dbService } from '../../api/basedatos';
import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionAsignaturas() {
    const navigate = useNavigate();

    const CLAVE_ENTIDAD = 'asignaturas';

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

    const [configModal, setConfigModal] = useState({
        abierto: false,
        mensaje: "",
        accion: null,
        payload: null
    });

    const cerrarModal = () => {
        setConfigModal({ abierto: false, mensaje: "", accion: null, payload: null });
    };

    const cargarDatos = useCallback(async () => {
        try {
            const data = await listaAsignaturas(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales.map(asig => ({
                ...asig,
                tipo_formateado: asig.tipo_formateado || (asig.tipo === 'O' ? 'Obligatoria' : asig.tipo === 'P' ? 'Optativa' : asig.tipo)
            }));
        } catch (error) {
            console.error("Error al obtener asignaturas:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setAsignaturas(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (asignatura) => {
        navigate(`/admin/asignaturas/editar/${asignatura.idasignatura}`);
    };

    const manejarEliminar = async (asignatura) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar la asignatura ${asignatura.nombre}?`,
            accion: 'eliminar',
            payload: asignatura
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todas las asignaturas de la base de datos. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const asignatura = configModal.payload;
            try {
                await eliminarAsignatura(asignatura.idasignatura);
                setAsignaturas(asignaturas.filter(a => a.idasignatura !== asignatura.idasignatura));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar la asignatura.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setAsignaturas(datosReales);
                });
            } catch (err) {
                console.error("Error al importar:", err);
                alert(err.message || "Error en la importación.");
            }
        }
        cerrarModal();
    };

    const manejarExportar = async () => {
        try {
            await dbService.exportarDatos(CLAVE_ENTIDAD);
        } catch (error) {
            console.error("Error al exportar:", error);
            alert("No se pudieron exportar los datos de asignaturas.");
        }
    };

    const manejarDescargarPlantilla = async () => {
        try {
            await dbService.descargarPlantilla(CLAVE_ENTIDAD);
        } catch (error) {
            console.error("Error al descargar plantilla:", error);
            alert("No se pudo descargar la plantilla de asignaturas.");
        }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Asignaturas"
                columnas={columnas}
                datos={asignaturas}
                rutaCrear="/admin/asignaturas/crear"
                onEditar={manejarEditar}
                onEliminar={manejarEliminar}
                onExportar={manejarExportar}
                onDescargarPlantilla={manejarDescargarPlantilla}
                onImportar={manejarImportar}
            />
            <ModalConfirmacion 
                isOpen={configModal.abierto}
                mensaje={configModal.mensaje}
                onConfirm={confirmarAccionModal}
                onCancel={cerrarModal}
            />
        </>
    );
}