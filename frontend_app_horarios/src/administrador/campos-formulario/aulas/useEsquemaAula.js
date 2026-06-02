import { useState, useEffect } from 'react';
import { listaMiniGrados } from '../../../api/docencia';

export function useEsquemaAula() {
    const [opcionesGrados, setOpcionesGrados] = useState([]);

    useEffect(() => {
        listaMiniGrados().then(grados => {
            setOpcionesGrados(grados.map(grado => ({
                valor: grado.id,
                texto: grado.nombre
            })));
        });
    }, []); 

    return [
        { llave: 'id', etiqueta: 'ID del Aula', tipo: 'numero', requerido: true },
        { llave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
        { llave: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', requerido: true },
        { 
            llave: 'campus', 
            etiqueta: 'Campus', 
            tipo: 'selector', 
            opciones: [{ valor: 'V', texto: 'Río Vena' }, { valor: 'M', texto: 'Milanera' }] 
        },
        { 
            llave: 'grado_id', 
            etiqueta: 'Grado Prioritario', 
            tipo: 'selector', 
            opciones: opcionesGrados
        },
        { llave: 'altavoces', etiqueta: 'Tiene Altavoces', tipo: 'booleano' },
        { llave: 'proyector', etiqueta: 'Tiene Proyector', tipo: 'booleano' },
        { llave: 'camara', etiqueta: 'Tiene Cámara', tipo: 'booleano' },
        { llave: 'enchufes', etiqueta: 'Enchufes en mesas', tipo: 'booleano' },
        { llave: 'otros', etiqueta: 'Información Adicional', tipo: 'area_texto', anchoCompleto: true },
    ];

}
