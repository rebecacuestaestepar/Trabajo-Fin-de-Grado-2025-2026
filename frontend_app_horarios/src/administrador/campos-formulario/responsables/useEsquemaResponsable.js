export function useEsquemaResponsable() {
    return [
        { llave: 'correo', etiqueta: 'Correo Electrónico', tipo: 'texto', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
        { llave: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto', requerido: true },
        { llave: 'telefono', etiqueta: 'Teléfono', tipo: 'numero' },
        { llave: 'codigo_docente', etiqueta: 'Código Docente (Si aplica)', tipo: 'texto' }
    ];
}