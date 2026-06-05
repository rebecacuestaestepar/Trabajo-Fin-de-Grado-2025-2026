import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaGrupos, eliminarGrupo } from '../../api/docencia';
import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionGrupos() {
    const navigate = useNavigate();
    const CLAVE_ENTIDAD = 'grupos';

    const columnas = [
        { llave: 'grupoid', etiqueta: 'ID' },
        { llave: 'nombre', etiqueta: 'Nombre del Grupo' },
        { llave: 'asignatura_nombre', etiqueta: 'Asignatura' },
        { llave: 'aula_nombre', etiqueta: 'Aula Asignada' }
    ];

    const [grupos, setGrupos] = useState([]);

    const [configModal, setConfigModal] = useState({
        abierto: false,
        mensaje: "",
        accion: null,
        payload: null
    });

    const cerrarModal = () => {
        setConfigModal({ abierto: false, mensaje: "", accion: null, payload: null });
    }

    const cargarDatos = useCallback(async () => {
        try {
            const data = await listaGrupos(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener grupos:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setGrupos(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (grupo) => {
        navigate(`/admin/grupos/editar/${grupo.grupoid}`);
    };

    const manejarEliminar = async (grupo) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar el grupo "${grupo.nombre}"?`,
            accion: 'eliminar',
            payload: grupo
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todos los grupos de docencia. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const grupo = configModal.payload;
            try {
                await eliminarGrupo(grupo.grupoid);
                setGrupos(grupos.filter(g => g.grupoid !== grupo.grupoid));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el grupo.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setGrupos(datosReales);
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
            console.error("Error al exportar grupos:", err);
            alert("Error al exportar grupos.");
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
                titulo="Gestión de Grupos"
                columnas={columnas}
                datos={grupos}
                rutaCrear="/admin/grupos/crear"
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