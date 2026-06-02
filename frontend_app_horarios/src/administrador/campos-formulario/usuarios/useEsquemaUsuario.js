import { useState, useEffect } from 'react';
import { listaMiniRoles } from '../../../api/usuarios'; 

export function useEsquemaUsuario() {
    const [opcionesRoles, setOpcionesRoles] = useState([]);

    useEffect(() => {
        listaMiniRoles().then(roles => {
            setOpcionesRoles(roles.map(rol => ({
                valor: rol.id, 
                texto: rol.name
            })));
        });
    }, []);

    return [
        { llave: 'username', etiqueta: 'Nombre de Usuario', tipo: 'texto', requerido: true },
        { llave: 'email', etiqueta: 'Correo Electrónico', tipo: 'texto', requerido: true },
        { llave: 'first_name', etiqueta: 'Nombre', tipo: 'texto' },
        { llave: 'last_name', etiqueta: 'Apellidos', tipo: 'texto' },
        { 
            llave: 'groups', 
            etiqueta: 'Rol Asignado', 
            tipo: 'selector', 
            opciones: opcionesRoles 
        },
        { 
            llave: 'is_active', 
            etiqueta: '¿Usuario Activo?', 
            tipo: 'selector', 
            opciones: [
                { valor: true, texto: 'Sí' },
                { valor: false, texto: 'No' }
            ]
        }
    ];
}