export function useEsquemaDocente() {
    return [
        { llave: 'codigo', etiqueta: 'Código / DNI', tipo: 'texto', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
        { llave: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto', requerido: true },
        { llave: 'correo', etiqueta: 'Correo Electrónico', tipo: 'texto', requerido: true },
        { llave: 'telefono', etiqueta: 'Teléfono', tipo: 'texto' }
    ];
}