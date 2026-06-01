import { apiRequest } from "./client";

export function obtenerUsuarios() {
    return apiRequest("/auth/usuarios/", {
        method: "GET",
    });
}

export function obtenerDetalleUsuario(usuarioId) {
    return apiRequest(`/auth/usuarios/${usuarioId}/`, {
        method: "GET",
    });
}

export function crearUsuario(datos) {
    return apiRequest("/auth/usuarios/", {
        method: "POST",
        body: datos
    });
}

export function actualizarUsuario(usuarioId, datos) {
    return apiRequest(`/auth/usuarios/${usuarioId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarUsuario(usuarioId) {
    return apiRequest(`/auth/usuarios/${usuarioId}/`, {
        method: "DELETE"
    });
}

export function obtenerRoles() {
    return apiRequest("/auth/roles/", {
        method: "GET",
    });
}

export function obtenerDetalleRol(rolId) {
    return apiRequest(`/auth/roles/${rolId}/`, {
        method: "GET",
    });
}

export function crearRol(datos) {
    return apiRequest("/auth/roles/", {
        method: "POST",
        body: datos
    });
}

export function actualizarRol(rolId, datos) {
    return apiRequest(`/auth/roles/${rolId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarRol(rolId) {
    return apiRequest(`/auth/roles/${rolId}/`, {
        method: "DELETE"
    });
}

export function listaMiniRoles() {
    return apiRequest("/auth/mini-roles/", {
        method: "GET",
    });
}

export function listaMiniPermisos() {
    return apiRequest("/auth/mini-permisos/", {
        method: "GET",
    });
}