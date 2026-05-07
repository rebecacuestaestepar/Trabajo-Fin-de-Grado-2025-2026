import { apiRequest } from "./client";

export function cargarHorarioExcel(payload) {
    return apiRequest("/docencia/cargar-horario/", {
        method : "POST",
        body: payload,
    });
}