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

export function obtenerGrados() {
    return apiRequest("/docencia/grados/", {
        method: "GET",
    });
}

export function obtenerCursosGrado(idGrado) {
    return apiRequest(`/docencia/grados/${idGrado}/cursos/`, {
        method: "GET",
    });
}

export function obtenerSemestresPorGradoCurso(idGrado, curso) {
    return apiRequest(`/docencia/grados/${idGrado}/cursos/${curso}/semestres/`, {
        method: "GET",
    });
}

export function obtenerAsignaturasPorGradoCursoSemestre(idGrado, curso, semestre) {
    return apiRequest(`/docencia/grados/${idGrado}/cursos/${curso}/semestres/${semestre}/asignaturas/`, {
        method: "GET",
    });
}

export function obtenerGruposAsignatura(idAsignatura) {
    return apiRequest(`/docencia/grupos/${idAsignatura}/`, {
        method: "GET",
    });
}