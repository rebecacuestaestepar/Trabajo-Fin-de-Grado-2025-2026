import { apiRequest } from "./client";

export function cargarHorarioExcel(payload) {
    return apiRequest("/docencia/cargar-horario/", {
        method : "POST",
        body: payload,
    });
}

export function obtenerCursos() {
    return apiRequest("/docencia/cursos/", {
        method: "GET",
    });
}

export function obtenerCursosConHorario() {
    return apiRequest("/horarios", {
        method: "GET",
    });
}

export function obtenerGradosPorCurso(idCurso) {
    return apiRequest(`/horarios/${idCurso}/grados/`, {
        method: "GET",
    });
}

/*export function enviarArchivoCurso(payload) {
    return apiRequest("/docencia/cursos/enviar/", {
        method: "POST",
        body: payload,
    });
}*/