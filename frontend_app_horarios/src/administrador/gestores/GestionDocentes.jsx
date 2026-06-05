import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaDocentes, eliminarDocente } from '../../api/docencia';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionDocentes() {
    const navigate = useNavigate();
    const CLAVE_ENTIDAD = 'docentes';

    const columnas = [
        { llave: 'nombre', etiqueta: 'Nombre' },
        { llave: 'apellidos', etiqueta: 'Apellidos' },
        { llave: 'correo', etiqueta: 'Correo' },
        { llave: 'telefono', etiqueta: 'Teléfono' }
    ];

    const [docentes, setDocentes] = useState([]);

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
            const data = await listaDocentes(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales; // Devolvemos el array
        } catch (error) {
            console.error("Error al obtener docentes:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setDocentes(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (docente) => {
        navigate(`/admin/docentes/editar/${docente.codigo}`);
    };

    const manejarEliminar = async (docente) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar al docente ${docente.nombre} ${docente.apellidos}?`,
            accion: 'eliminar',
            payload: docente
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todos los docentes de la base de datos. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        // 1. Si la acción pendiente era ELIMINAR
        if (configModal.accion === 'eliminar') {
            const docente = configModal.payload;
            try {
                await eliminarDocente(docente.codigo);
                setDocentes(docentes.filter(d => d.codigo !== docente.codigo));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el docente.");
            }
        } 
        // 2. Si la acción pendiente era IMPORTAR
        else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setDocentes(datosReales);
                });
            } catch (err) {
                console.error("Error al importar:", err);
                alert(err.message || "Error en la importación.");
            }
        }

        // 3. Cerramos la modal en cualquier caso
        cerrarModal();
    };

    const manejarExportar = async () => {
        try { await dbService.exportarDatos(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al exportar docentes:", err);
            alert("Error al exportar docentes."); }
    };

    const manejarDescargarPlantilla = async () => {
        try { await dbService.descargarPlantilla(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al descargar plantilla:", err);
            alert("Error al descargar plantilla."); }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Docentes"
                columnas={columnas}
                datos={docentes}
                rutaCrear="/admin/docentes/crear"
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