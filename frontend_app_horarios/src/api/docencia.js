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
    return apiRequest("/docencia", {
        method: "GET",
    });
}

export function obtenerGradosPorCurso(idCurso) {
    return apiRequest(`/docencia/${idCurso}/grados/`, {
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
    return apiRequest("/docencia/grados/lista/", {
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

export function eliminarReservaPeriodica(id_curso, semestre_num, firma_serie) {
    return apiRequest("/docencia/eliminar-reserva-periodica/", {
        method: "POST",
        body: JSON.stringify({ id_curso, semestre_num, firma_serie }),
    });
}

export function reservaDesdeHorarioGrado(id_grado, semestre) {
    return apiRequest(`/docencia/cargar-asignaturas/grado/${id_grado}/semestre/${semestre}/`, {
        method: "GET",
    });
}

export function crearGrado(datos) {
    return apiRequest("/docencia/grados/", {
        method: "POST",
        body: datos
    });
}

export function actualizarGrado(gradoId, datos) {
    return apiRequest(`/docencia/grados/${gradoId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarGrado(gradoId) {
    return apiRequest(`/docencia/grados/${gradoId}/`, {
        method: "DELETE"
    });
}

export function obtenerDetalleGrado(gradoId) {
    return apiRequest(`/docencia/grados/${gradoId}/`, {
        method: "GET",
    });
}

export function listaGrados() {
    return apiRequest("/docencia/grados/", {
        method: "GET",
    });
}

export function listaMiniGrados() {
    return apiRequest("/docencia/mini-grados/", {
        method: "GET",
    });
}

export function listaMiniAsignaturas() {
    return apiRequest("/docencia/mini-asignaturas/", {
        method: "GET",
    });
}

export function listaMiniDocentes() {
    return apiRequest("/docencia/mini-docentes/", {
        method: "GET",
    });
}

export function listaMiniGrupos() {
    return apiRequest("/docencia/mini-grupos/", {
        method: "GET",
    });
}

export function obtenerDetalleAsignatura(asignaturaId) {
    return apiRequest(`/docencia/asignaturas/${asignaturaId}/`, {
        method: "GET",
    });
}

export function crearAsignatura(datos) {
    return apiRequest("/docencia/asignaturas/", {
        method: "POST",
        body: datos
    });
}

export function actualizarAsignatura(asignaturaId, datos) {
    return apiRequest(`/docencia/asignaturas/${asignaturaId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarAsignatura(asignaturaId) {
    return apiRequest(`/docencia/asignaturas/${asignaturaId}/`, {
        method: "DELETE"
    });
}

export function listaAsignaturas() {
    return apiRequest("/docencia/asignaturas/", {
        method: "GET",
    });
}

export function obtenerDetalleDocente(docenteId) {
    return apiRequest(`/docencia/docentes/${docenteId}/`, {
        method: "GET",
    });
}

export function crearDocente(datos) {
    return apiRequest("/docencia/docentes/", {
        method: "POST",
        body: datos
    });
}

export function actualizarDocente(docenteId, datos) {
    return apiRequest(`/docencia/docentes/${docenteId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarDocente(docenteId) {
    return apiRequest(`/docencia/docentes/${docenteId}/`, {
        method: "DELETE"
    });
}

export function listaDocentes() {
    return apiRequest("/docencia/docentes/", {
        method: "GET",
    });
}

export function obtenerDetalleGrupo(grupoId) {
    return apiRequest(`/docencia/grupos/${grupoId}/`, {
        method: "GET",
    });
}

export function crearGrupo(datos) {
    return apiRequest("/docencia/grupos/", {
        method: "POST",
        body: datos
    });
}

export function actualizarGrupo(grupoId, datos) {
    return apiRequest(`/docencia/grupos/${grupoId}/`, {
        method: "PUT",
        body: datos
    });
}

export function eliminarGrupo(grupoId) {
    return apiRequest(`/docencia/grupos/${grupoId}/`, {
        method: "DELETE"
    });
}

export function listaGrupos() {
    return apiRequest("/docencia/grupos/", {
        method: "GET",
    });
}

