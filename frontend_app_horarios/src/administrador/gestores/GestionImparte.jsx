import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaImparte, eliminarImparte } from '../../api/docencia';

import { dbService } from '../../api/basedatos';
import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionImparte() {
    const navigate = useNavigate();

    const CLAVE_ENTIDAD = 'imparte';

    const columnas = [
        { llave: 'docente_nombre', etiqueta: 'Nombre del Docente' },
        { llave: 'docente_apellidos', etiqueta: 'Apellidos' },
        { llave: 'asignatura_nombre', etiqueta: 'Asignatura' },
        { llave: 'grado_abreviatura', etiqueta: 'Grado' }
    ];

    const [asignaciones, setAsignaciones] = useState([]);

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
            const data = await listaImparte(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener las asignaciones de imparte:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setAsignaciones(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (asignacion) => {
        navigate(`/admin/imparte/editar/${asignacion.id}`);
    };

    const manejarEliminar = async (asignacion) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar la asignación del docente ${asignacion.docente_nombre} ${asignacion.docente_apellidos} a la asignatura de ${asignacion.asignatura_nombre}?`,
            accion: 'eliminar',
            payload: asignacion
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todas las asignaciones de docencia (Imparte) de la base de datos. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const asignacion = configModal.payload;
            try {
                await eliminarImparte(asignacion.id);
                setAsignaciones(asignaciones.filter(a => a.id !== asignacion.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar la asignación.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setAsignaciones(datosReales);
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
            alert("No se pudieron exportar los datos de asignaciones.");
        }
    };

    const manejarDescargarPlantilla = async () => {
        try {
            await dbService.descargarPlantilla(CLAVE_ENTIDAD);
        } catch (error) {
            console.error("Error al descargar plantilla:", error);
            alert("No se pudo descargar la plantilla de Imparte.");
        }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Asignaciones (Imparte)"
                columnas={columnas}
                datos={asignaciones}
                rutaCrear="/admin/imparte/crear"
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