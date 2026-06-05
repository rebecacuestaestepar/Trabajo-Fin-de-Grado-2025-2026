import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerRoles, eliminarRol } from '../../api/usuarios';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionRoles() {
    const navigate = useNavigate();
    const CLAVE_ENTIDAD = 'roles';

    const columnas = [
        { llave: 'id', etiqueta: 'ID' },
        { llave: 'name', etiqueta: 'Nombre del Rol' }
    ];

    const [roles, setRoles] = useState([]);

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
            const data = await obtenerRoles(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener roles:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setRoles(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (rol) => {
        navigate(`/admin/roles/editar/${rol.id}`);
    };

    const manejarEliminar = async (rol) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar el rol ${rol.name}?`,
            accion: 'eliminar',
            payload: rol
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todos los roles y permisos del sistema. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const rol = configModal.payload;
            try {
                await eliminarRol(rol.id);
                setRoles(roles.filter(r => r.id !== rol.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el rol.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setRoles(datosReales);
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
            console.error("Error al exportar roles:", err);
            alert("Error al exportar roles."); }
    };

    const manejarDescargarPlantilla = async () => {
        try { await dbService.descargarPlantilla(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al descargar plantilla:", err);
            alert("Error al descargar plantilla."); }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Roles"
                columnas={columnas}
                datos={roles}
                rutaCrear="/admin/roles/crear"
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