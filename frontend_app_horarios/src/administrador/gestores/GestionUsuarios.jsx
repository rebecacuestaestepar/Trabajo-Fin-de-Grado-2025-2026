import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaTablaAdministrador from '../paginas/VistaTablaAdministrador';
import { obtenerUsuarios, eliminarUsuario } from '../../api/usuarios'; 

export default function GestionUsuarios() {
    const navigate = useNavigate();

    const columnas = [
        { llave: 'id', etiqueta: 'ID' },
        { llave: 'username', etiqueta: 'Usuario' },
        { llave: 'email', etiqueta: 'Correo Electrónico' },
        { llave: 'roles_nombres', etiqueta: 'Roles' },
        { llave: 'is_active', etiqueta: 'Activo' }
    ];

    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const data = await obtenerUsuarios(); 
                let datosReales = [];
                if (Array.isArray(data)) datosReales = data;
                else if (data && data.results && Array.isArray(data.results)) datosReales = data.results;
                
                setUsuarios(datosReales);
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            }
        };
        cargarDatos();
    }, []);

    const manejarEditar = (usuario) => {
        navigate(`/admin/usuarios/editar/${usuario.id}`);
    };

    const manejarEliminar = async (usuario) => {
        if (window.confirm(`¿Seguro que deseas eliminar al usuario ${usuario.username}?`)) {
            try {
                await eliminarUsuario(usuario.id);
                setUsuarios(usuarios.filter(u => u.id !== usuario.id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al eliminar el usuario.");
            }
        }
    };

    return (
        <VistaTablaAdministrador 
            titulo="Gestión de Usuarios"
            columnas={columnas}
            datos={usuarios}
            rutaCrear="/admin/usuarios/crear"
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
            onExportar={() => console.log("Exportar Excel")}
        />
    );
}