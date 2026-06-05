import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaGrados, eliminarGrado } from '../../api/docencia';

import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionGrados() {
    const navigate = useNavigate();
    const CLAVE_ENTIDAD = 'grados';

    const columnas = [
        { llave: 'idgrado', etiqueta: 'Código' },
        { llave: 'nombre', etiqueta: 'Nombre del Grado' },
        { llave: 'abreviatura', etiqueta: 'Abreviatura' },
        { llave: 'coordinador', etiqueta: 'Coordinador' }
    ];

    const [grados, setGrados] = useState([]);

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
            const data = await listaGrados(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales;
        } catch (error) {
            console.error("Error al obtener grados:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarDatos().then((datosReales) => {
            setGrados(datosReales);
        });
    }, [cargarDatos]);

    const manejarEditar = (grado) => {
        navigate(`/admin/grados/editar/${grado.idgrado}`);
    };

    const manejarEliminar = async (grado) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar el grado "${grado.nombre}" y sus dependencias?`,
            accion: 'eliminar',
            payload: grado
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todos los grados de la base de datos. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const grado = configModal.payload;
            try {
                await eliminarGrado(grado.idgrado);
                setGrados(grados.filter(g => g.idgrado !== grado.idgrado));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el grado.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarDatos().then((datosReales) => {
                    setGrados(datosReales);
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
            console.error("Error al exportar grados:", err);
            alert("Error al exportar grados.");
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
                titulo="Gestión de Grados"
                columnas={columnas}
                datos={grados}
                rutaCrear="/admin/grados/crear"
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