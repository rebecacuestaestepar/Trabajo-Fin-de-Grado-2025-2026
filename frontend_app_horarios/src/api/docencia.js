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

export function obtenerSemestresPorGrado(idGrado) {
    return apiRequest(`/docencia/${idGrado}/semestres/`, {
        method: "GET",
    });
}

export function obtenerAsignaturasPorGradoYSemestre(idGrado, idSemestre, idCurso) {
    return apiRequest(`/docencia/${idGrado}/asignaturas/semestre/${idSemestre}/?id_curso=${idCurso}`, {
        method: "GET",
    });
}