import { useState, useEffect } from 'react';
import { listaMiniPermisos } from '../../../api/usuarios'; 

export function useEsquemaRol() {
    const [opcionesPermisos, setOpcionesPermisos] = useState([]);

    useEffect(() => {
        listaMiniPermisos().then(permisos => {
            setOpcionesPermisos(permisos.map(p => ({
                valor: p.id,
                texto: `${p.content_type__app_label.toUpperCase()} - ${p.name}`
            })));
        });
    }, []);

    return [
        { llave: 'name', etiqueta: 'Nombre del Rol', tipo: 'texto', requerido: true },
        { 
            llave: 'permissions',
            etiqueta: 'Permisos del Sistema Asignados', 
            tipo: 'checkboxes',
            opciones: opcionesPermisos 
        }
    ];
}