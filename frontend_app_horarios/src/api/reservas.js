import { apiRequest, apiGet, apiPatch, apiPost } from "./client";


export function buscarAulasDisponibles(payload) {
    return apiRequest("/aulas/disponibles/", {
        method : "POST",
        body: payload,
    });
}

export function solicitarReservaPuntual(payload) {
    return apiRequest("/reservas/solicitar/", {
        method : "POST",
        body: payload,
    });
}

// Lista pendientes
export function getReservasPendientes() {
  return apiGet("/reservas/pendientes/");
}

// Detalle
export function getReservaDetalle(id) {
  return apiGet(`/reservas/${id}/`);
}

// Actualizar
export function patchReserva(id, parcial) {
  return apiPatch(`/reservas/${id}/`, parcial);
}

// Aulas candidatas
export function postAulasCandidatas(id, payload) {
  return apiPost(`/reservas/${id}/aulas-candidatas/`, payload);
}

// Aprobar / Rechazar
export function aprobarReserva(id) {
  return apiPost(`/reservas/${id}/aprobar/`);
}

export function rechazarReserva(id) {
  return apiPost(`/reservas/${id}/rechazar/`);
}