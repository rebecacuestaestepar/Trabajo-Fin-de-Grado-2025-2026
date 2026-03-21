import { apiRequest } from "./client";

export function cargarCalendarioFormulario(payload) {
    return apiRequest("/calendario/cargar/formulario/", {
        method : "POST",
        body: payload,
    });
}

