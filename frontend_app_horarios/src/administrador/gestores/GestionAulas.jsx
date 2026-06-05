import React, { useState, useEffect, useCallback } from 'react';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { listaAulas, eliminarAula } from '../../api/aulas';
import { useNavigate } from 'react-router-dom';

import { dbService } from '../../api/basedatos';

import ModalConfirmacion from '../../shared/modales/ModalConfirmacion';

export default function GestionAulas() {
    const navigate = useNavigate();

    const CLAVE_ENTIDAD = 'aulas';

    const columnasAulas = [
        { llave: 'nombre', etiqueta: 'Aula' },
        { llave: 'edificio', etiqueta: 'Edificio' },
        { llave: 'capacidad', etiqueta: 'Capacidad' },
        { llave: 'campus_formateado', etiqueta: 'Campus' },
    ];

    const [aulas, setAulas] = useState([]);

    const [configModal, setConfigModal] = useState({
        abierto: false,
        mensaje: "",
        accion: null,
        payload: null
    });

    const cerrarModal = () => {
        setConfigModal({ abierto: false, mensaje: "", accion: null, payload: null });
    };

    const cargarAulas = useCallback(async () => {
        try {
            const data = await listaAulas(); 
            let datosReales = [];
            if (Array.isArray(data)) datosReales = data;
            else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
            
            return datosReales.map(aula => ({
                ...aula,
                campus_formateado: aula.campus_formateado || (aula.campus === 'V' ? 'Río Vena' : 'Milanera')
            }));
        } catch (error) {
            console.error("Error al obtener las aulas desde el servidor:", error);
            return [];
        }
    }, []);

    useEffect(() => {
        cargarAulas().then((datosReales) => {
            setAulas(datosReales);
        });
    }, [cargarAulas]);

    const manejarEditar = (aula) => {
        navigate(`/admin/aulas/editar/${aula.id}`);
    };

    const manejarEliminar = async (aula) => {
        setConfigModal({
            abierto: true,
            mensaje: `¿Seguro que deseas eliminar el aula ${aula.nombre}?`,
            accion: 'eliminar',
            payload: aula
        });
    };

    const manejarImportar = (archivo) => {
        if (!archivo) return;
        setConfigModal({
            abierto: true,
            mensaje: "¡Atención! Se sobrescribirán todas las aulas de la base de datos. ¿Deseas continuar?",
            accion: 'importar',
            payload: archivo
        });
    };

    const confirmarAccionModal = async () => {
        if (configModal.accion === 'eliminar') {
            const aula = configModal.payload;
            try {
                await eliminarAula(aula.id);
                setAulas(aulas.filter(a => a.id !== aula.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el aula.");
            }
        } else if (configModal.accion === 'importar') {
            const archivo = configModal.payload;
            try {
                await dbService.importarDatos(archivo, CLAVE_ENTIDAD);
                cargarAulas().then((datosReales) => {
                    setAulas(datosReales);
                });
            } catch (err) {
                console.error("Error al importar:", err);
                alert(err.message || "Error al importar.");
            }
        }
        cerrarModal();
    };

    const manejarExportar = async () => {
        try {
            await dbService.exportarDatos(CLAVE_ENTIDAD);
        } catch (err) { 
            console.error("Error al exportar aulas:", err);
            alert("Error al exportar aulas."); }
    };

    const manejarDescargarPlantilla = async () => {
        try {
            await dbService.descargarPlantilla(CLAVE_ENTIDAD);
        } catch (err) { 
            console.error("Error al descargar plantilla de aulas:", err);
            alert("Error al descargar plantilla de aulas."); }
    };

    return (
        <>
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
            <ModalConfirmacion 
                isOpen={configModal.abierto}
                mensaje={configModal.mensaje}
                onConfirm={confirmarAccionModal}
                onCancel={cerrarModal}
            />
        </>
    );
}