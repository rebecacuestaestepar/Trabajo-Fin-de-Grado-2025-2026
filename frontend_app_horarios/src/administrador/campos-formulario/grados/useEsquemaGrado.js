export function useEsquemaGrado() {
    /*
    * Este hook define el esquema de campos para los formularios de creación y edición de grados.
    * Cada objeto en el array representa un campo del formulario con sus propiedades:
    */
    return [
        { llave: 'idgrado', etiqueta: 'Código del Grado', tipo: 'texto', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre Completo', tipo: 'texto', requerido: true },
        { llave: 'abreviatura', etiqueta: 'Abreviatura', tipo: 'texto', requerido: true },
        { llave: 'coordinador', etiqueta: 'Coordinador', tipo: 'texto' }
    ];
}