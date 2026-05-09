import { cargarHorarioExcel } from "../api/docencia";

export const enviarExcel = async (archivoExcel, curso) => {
    const formData = new FormData();
    formData.append("archivo_excel", archivoExcel);
    formData.append("curso", curso);

    try {
        const response = await cargarHorarioExcel(formData);

        const data = await response.json();
        if (response.ok) {
            alert("Horario cargado correctamente");
        } else {
            alert("Error al cargar el horario: " + data.error);
        }
    } catch (error) {
        alert("Error al cargar el horario: " + error.message);
    }
};