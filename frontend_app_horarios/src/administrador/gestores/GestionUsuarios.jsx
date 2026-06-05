import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerUsuarios, eliminarUsuario } from '../../api/usuarios';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionUsuarios() {
    const navigate = useNavigate();

    const CLAVE_ENTIDAD = 'usuarios';

    const columnas = [
        { llave: 'id', etiqueta: 'ID' },
        { llave: 'username', etiqueta: 'Usuario' },
        { llave: 'email', etiqueta: 'Correo Electrónico' },
        { llave: 'roles_nombres', etiqueta: 'Roles' },
        { llave: 'is_active', etiqueta: 'Activo' }
    ];

    const [usuarios, setUsuarios] = useState([]);

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
            const data = await obtenerUsuarios(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setUsuarios(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (usuario) => {
        navigate(`/admin/usuarios/editar/${usuario.id}`);
    };

    const manejarEliminar = async (usuario) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar al usuario ${usuario.username}?`,
            accion: 'eliminar',
            payload: usuario
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se purgará la tabla completa de usuarios del sistema para cargar los registros nuevos. ¿Proceder?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const usuario = configModal.payload;
            try {
                await eliminarUsuario(usuario.id);
                setUsuarios(usuarios.filter(u => u.id !== usuario.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el usuario.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setUsuarios(datosReales);
                });
            } catch (err) {
                console.error("Error al importar usuarios:", err);
                alert(err.message || "Error en la importación.");
            }
        }
        cerrarModal();
    };
    const manejarExportar = async () => {
        try { await dbService.exportarDatos(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al exportar usuarios:", err);
            alert("Error al exportar usuarios."); }
    };

    const manejarDescargarPlantilla = async () => {
        try { await dbService.descargarPlantilla(CLAVE_ENTIDAD); } catch (err) { 
            console.error("Error al descargar plantilla:", err);
            alert("Error al descargar plantilla."); }
    };

    return (
        <>
            <VistaTablaAdministrador 
                titulo="Gestión de Usuarios"
                columnas={columnas}
                datos={usuarios}
                rutaCrear="/admin/usuarios/crear"
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