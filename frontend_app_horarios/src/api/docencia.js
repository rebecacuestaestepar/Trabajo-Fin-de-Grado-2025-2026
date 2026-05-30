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

export function validarRestricciones(id_curso, semestre_num, id_grado, datos_movimiento) {
    return apiRequest("/docencia/validar-restricciones/", {
        method: "POST",
        body: { id_curso, semestre_num, id_grado, datos_movimiento }
    });
}

export function moverReservaPeriodica(id_curso, semestre_num, datos_movimiento) {
    return apiRequest("/docencia/mover-reserva-periodica/", {
        method: "POST",
        body: { id_curso, semestre_num, datos_movimiento }
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

export function obtenerAulasLibres({diaSemana, horaInicio, horaFin}) {
    const params = new URLSearchParams({dia_semana: diaSemana, hora_inicio: horaInicio, hora_fin: horaFin});
    return apiRequest(`/docencia/aulas-libres/?${params.toString()}`, {
        method: "GET",
    });
}

export function crearReservaPeriodica(datosReserva) {
    return apiRequest("/docencia/crear-reserva-periodica/", {
        method: "POST",
        body: JSON.stringify(datosReserva),
    });
}

export function obtenerDatosReservaPeriodica(idReserva) {
    return apiRequest(`/docencia/datos-reserva-periodica/${idReserva}/`, {
        method: "GET",
    });
}

export function reservaDesdeHorarioGrado(id_grado, semestre) {
    return apiRequest(`/docencia/cargar-asignaturas/grado/${id_grado}/semestre/${semestre}/`, {
        method: "GET",
    });
}