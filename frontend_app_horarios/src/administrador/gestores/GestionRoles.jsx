import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerRoles, eliminarRol } from '../../api/usuarios'; 

export default function GestionRoles() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'id', etiqueta: 'ID' },
        { llave: 'name', etiqueta: 'Nombre del Rol' }
    ];

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await obtenerRoles(); 
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setRoles(datosReales);
            } catch (error) {
                console.error("Error al obtener roles:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (rol) => {
        navigate(`/admin/roles/editar/${rol.id}`);
    };

    const manejarEliminar = async (rol) => {
        if (window.confirm(`¿Seguro que deseas eliminar el rol ${rol.name}?`)) {
            try {
                await eliminarRol(rol.id);
                setRoles(roles.filter(r => r.id !== rol.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el rol.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Roles"
            columnas={columnas}
            datos={roles}
            rutaCrear="/admin/roles/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
        />
    );
}