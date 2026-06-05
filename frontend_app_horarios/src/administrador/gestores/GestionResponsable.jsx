import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerResponsables, eliminarResponsable } from '../../api/reservas';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionResponsables() {
    const navigate = useNavigate();
    const CLAVE_ENTIDAD = 'responsables';

    const columnas = [
        { llave: 'correo', etiqueta: 'Correo Electrónico' },
        { llave: 'nombre', etiqueta: 'Nombre' },
        { llave: 'apellidos', etiqueta: 'Apellidos' },
        { llave: 'telefono', etiqueta: 'Teléfono' },
        { llave: 'codigo_docente', etiqueta: 'Cód. Docente' }
    ];

    const [responsables, setResponsables] = useState([]);

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
            const data = await obtenerResponsables(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener responsables:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setResponsables(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (responsable) => {
        navigate(`/admin/responsables/editar/${responsable.correo}`);
    };

    const manejarEliminar = async (responsable) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar al responsable ${responsable.nombre}?`,
            accion: 'eliminar',
            payload: responsable
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todos los responsables del sistema. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const responsable = configModal.payload;
            try {
                await eliminarResponsable(responsable.correo);
                setResponsables(responsables.filter(r => r.correo !== responsable.correo));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar al responsable.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setResponsables(datosReales);
                });
            } catch (err) {
                console.error("Error al importar:", err);
                alert(err.message || "Error al importar.");
            }
        }
        cerrarModal();
    };

    const manejarExportar = async () => {
        try { await dbService.exportarDatos(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al exportar responsables:", err);
            alert("Error al exportar responsables.");
        }
    };

    const manejarDescargarPlantilla = async () => {
        try { await dbService.descargarPlantilla(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al descargar plantilla:", err);
            alert("Error al descargar plantilla.");
        }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Responsables"
                columnas={columnas}
                datos={responsables}
                rutaCrear="/admin/responsables/crear"
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