export function useEsquemaGrado() {
    return [
        { llave: 'idgrado', etiqueta: 'Código del Grado', tipo: 'texto', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre Completo', tipo: 'texto', requerido: true },
        { llave: 'abreviatura', etiqueta: 'Abreviatura', tipo: 'texto', requerido: true },
        { llave: 'coordinador', etiqueta: 'Coordinador', tipo: 'texto' }
    ];
}