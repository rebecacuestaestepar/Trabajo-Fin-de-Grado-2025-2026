import { apiRequest } from "./client";

export function cargarCalendarioFormulario(payload) {
    return apiRequest("/calendario/cargar/formulario/", {
        method : "POST",
        body: payload,
    });
}

export function obtenerCursos() {
    return apiRequest("/docencia/cursos/", {
        method: "GET",
    });
}

export function obtenerCalendarioCurso(id_curso) {
    return apiRequest(`/calendario/curso/${id_curso}/`, {
        method: "GET",
    });
}

export function modificarTipoDiaCalendario(payload) {
    return apiRequest("/calendario/dia/modificar/", {
        method: "POST",
        body: payload,
    });
}

