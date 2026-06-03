import React from 'react';

export default function RequierePermiso({ permisos, condicion = 'alguno', children }) {
    const permisosString = sessionStorage.getItem('permisos');
    
    const permisosUsuario = permisosString ? JSON.parse(permisosString) : [];

    const listaPermisosRequeridos = Array.isArray(permisos) ? permisos : [permisos];

    let tienePermiso = false;

    if (condicion === 'alguno') {
        tienePermiso = listaPermisosRequeridos.some(p => permisosUsuario.includes(p));
    } else if (condicion === 'todos') {
        tienePermiso = listaPermisosRequeridos.every(p => permisosUsuario.includes(p));
    }

    if (!tienePermiso) {
        return null;
    }

    return <>{children}</>;
}