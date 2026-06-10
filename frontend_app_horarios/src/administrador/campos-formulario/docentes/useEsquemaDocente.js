export function useEsquemaDocente() {
    /*
    * Este hook define el esquema de campos para los formularios de creación y edición de docentes.
    * Cada objeto en el array representa un campo del formulario con sus propiedades:
    */
    return [
        { llave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
        { llave: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto', requerido: true },
        { llave: 'correo', etiqueta: 'Correo Electrónico', tipo: 'texto', requerido: true },
        { llave: 'telefono', etiqueta: 'Teléfono', tipo: 'texto' }
    ];
}