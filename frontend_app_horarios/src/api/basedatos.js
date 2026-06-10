import { apiRequest } from "./client";

// Helper para descargar los archivos binarios que devuelva el fetch
const descargarBlob = (blobData, nombreArchivo) => {
    const dataBlob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
};

export const dbService = {
    /**
     * GET - Exporta datos (Toda la BD o entidades sueltas)
     */
    exportarDatos: async (entidad = 'all') => {
        const blob = await apiRequest(`/db/exportar/?entidad=${entidad}`, { 
            method: "GET",
            responseType: 'blob' 
        });
        descargarBlob(blob, `exportacion_${entidad}.xlsx`);
    },

    /**
     * GET - Descarga plantilla estructurada vacía
     */
    descargarPlantilla: async (entidad = 'all') => {
        const blob = await apiRequest(`/db/plantilla/?entidad=${entidad}`, { 
            method: "GET",
            responseType: 'blob' 
        });
        descargarBlob(blob, `plantilla_${entidad}.xlsx`);
    },

    /**
     * POST - Envía el Excel de la BD empaquetado en FormData
     */
    importarDatos: async (archivo, entidad = 'all') => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('entidad', entidad);
        return await apiRequest("/db/importar/", {
            method: "POST",
            body: formData,
        });
    }
};