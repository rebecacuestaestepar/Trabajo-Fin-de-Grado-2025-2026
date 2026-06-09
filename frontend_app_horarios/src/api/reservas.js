import { apiRequest } from "./client";

// ----------------------------------------------
// --- PÁGINA DE SOLICITUD DE RESERVA PUNTUAL ---
// ----------------------------------------------
// Endpoint para buscar aulas disponibles
export function buscarAulasDisponibles(payload) {
    return apiRequest("/aulas/disponibles/", {
        method : "POST",
        body: payload,
    });
}

// Endpoint para solicitar una reserva puntual
export function solicitarReservaPuntual(payload) {
    return apiRequest("/reservas/solicitar/", {
        method : "POST",
        body: payload,
    });
}

export function crearReservaPuntual(payload) {
    return apiRequest("/reservas/crear/", {
        method : "POST",
        body: payload,
    });
}

// ------------------------------------------------
// --- PÁGINA DE GESTIÓN DE RESERVAS PENDIENTES ---
// ------------------------------------------------
// Lista pendientes
export function getReservasPendientes() {
  return apiRequest("/reservas/pendientes/", {
    method: "GET",
  });
}

// Detalle
export function getReservaDetalle(id) {
  return apiRequest(`/reservas/${id}/`, {
    method: "GET",
  });
}

// Actualizar
export function patchReserva(id, parcial) {
  console.log("Parcial enviado:", parcial);
  return apiRequest(`/reservas/${id}/`, {
    method: "PATCH",
    body: parcial
  });
}

// Aulas candidatas
export function postAulasCandidatas(id, payload) {
  return apiRequest(`/reservas/${id}/aulas-candidatas/`, {
    method: "POST",
    body: payload
  });
}

// Aprobar / Rechazar
export function aprobarReserva(id) {
  return apiRequest(`/reservas/${id}/aprobar/`, {
    method: "POST"
  });
}

export function rechazarReserva(id) {
  return apiRequest(`/reservas/${id}/rechazar/`, {
    method: "POST"
  });
}

export function aprobarReservasMasivo(ids) {
  return apiRequest(`/reservas/aprobar-masivo/`, {
    method: "POST",
    body: { ids }
  });
}

export function rechazarReservasMasivo(ids) {
  return apiRequest(`/reservas/rechazar-masivo/`, {
    method: "POST",
    body: { ids }
  });
}

// ------------------------------------------------
// --- PÁGINA DE GESTIÓN DE TODAS LAS RESERVAS  ---
// ------------------------------------------------

export function getTodasReservas() {
  console.log("Obteniendo todas las reservas...");
  return apiRequest("/reservas/todas/", {
    method: "GET"
  });
}

export function getReservasUsuario(usuario) {
  console.log(`Obteniendo reservas para el usuario: ${usuario}...`);
  return apiRequest(`/reservas/todas/${usuario}/`, {
    method: "GET"
  });
}

export function eliminarReserva(id) {
  return apiRequest(`/reservas/${id}/`, {
    method: "DELETE",
  });
}

export function eliminarReservasMasivo(ids) {
  return apiRequest(`/reservas/eliminar-masivo/`, {
    method: "POST",
    body: { ids }
  });
}

export function crearResponsable(datos) {
  return apiRequest("/responsables/", {
    method: "POST",
    body: datos
  });
}

export function actualizarResponsable(correo, datos) {
  return apiRequest(`/responsables/${correo}/`, {
    method: "PUT",
    body: datos
  });
}

export function eliminarResponsable(correo) {
  return apiRequest(`/responsables/${correo}/`, {
    method: "DELETE",
  });
}

export function obtenerDetalleResponsable(correo) {
  return apiRequest(`/responsables/${correo}/`, {
    method: "GET",
  });
}

export function obtenerResponsables() {
  return apiRequest("/responsables/", {
    method: "GET",
  });
}
