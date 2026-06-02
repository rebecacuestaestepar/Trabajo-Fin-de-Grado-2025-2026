import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaPagina from '../../reservas/formulario-componentes/ui/TarjetaPagina';
import BotonVolver from '../../reservas/formulario-componentes/ui/BotonVolver';
import { Campo } from '../../reservas/formulario-componentes/ui/Campo';
import { EntradaTexto, Selector, AreaTexto } from '../../reservas/formulario-componentes/ui/Inputs';

export default function FormularioDinamico({ 
    titulo, 
    esquema, 
    datosIniciales = {}, 
    alGuardar, 
    rutaVolver 
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const datosCargados = { ...datosIniciales };
        esquema.forEach(campo => {
            if (datosCargados[campo.llave] === undefined) {
                datosCargados[campo.llave] = campo.tipo === 'booleano' ? false : '';
            }
        });
        setFormData(datosCargados);
    }, [JSON.stringify(esquema), JSON.stringify(datosIniciales)]);

    const manejarCambio = (llave, valor) => {
        setFormData(prev => ({ ...prev, [llave]: valor }));
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        alGuardar(formData);
    };

    const manejarCambioCheckboxMultiple = (llave, valorOpcion, estaMarcado) => {
        const listaActual = formData[llave] || [];
        
        let nuevaLista;
        if (estaMarcado) {
            nuevaLista = [...listaActual, valorOpcion];
        } else {
            nuevaLista = listaActual.filter(v => v !== valorOpcion);
        }
        
        setDatosFormulario({ ...datosFormulario, [llave]: nuevaLista });
    };

    const renderizarInput = (campo) => {
        switch (campo.tipo) {
            case 'texto':
            case 'numero':
                return (
                    <EntradaTexto
                        type={campo.tipo === 'numero' ? 'number' : 'text'}
                        value={formData[campo.llave] || ''}
                        onChange={(e) => manejarCambio(campo.llave, e.target.value)}
                        required={campo.requerido}
                    />
                );
            case 'selector':
                return (
                    <Selector
                        value={formData[campo.llave] || ''}
                        onChange={(e) => manejarCambio(campo.llave, e.target.value)}
                        required={campo.requerido}
                    >
                        <option value="">Selecciona una opción</option>
                        {campo.opciones.map(opt => (
                            <option key={opt.valor} value={opt.valor}>{opt.texto}</option>
                        ))}
                    </Selector>
                );
            case 'booleano':
                return (
                    <input
                        type="checkbox"
                        checked={formData[campo.llave] || false}
                        onChange={(e) => manejarCambio(campo.llave, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#7a1e1e] focus:ring-[#7a1e1e]"
                    />
                );
            case 'area_texto':
                return (
                    <AreaTexto
                        value={formData[campo.llave] || ''}
                        onChange={(e) => manejarCambio(campo.llave, e.target.value)}
                        rows={3}
                    />
                );
            case 'checkboxes':
                return (
                    <div className="flex flex-col gap-2 border border-slate-300 rounded p-4 h-64 overflow-y-auto bg-slate-50 mt-1">
                        {campo.opciones && campo.opciones.map((opcion, index) => {
                            const valorOpcion = opcion.valor || opcion.id;
                            const textoOpcion = opcion.texto || opcion.name;
                            
                            const isChecked = (formData[campo.llave] || []).includes(valorOpcion);

                            return (
                                <label key={valorOpcion || index} className="flex items-start space-x-2 text-sm cursor-pointer hover:bg-slate-200 p-1.5 rounded transition-colors">
                                    <input 
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7a1e1e] focus:ring-[#7a1e1e]"
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const listaActual = formData[campo.llave] || [];
                                            let nuevaLista;
                                            if (e.target.checked) {
                                                nuevaLista = [...listaActual, valorOpcion];
                                            } else {
                                                nuevaLista = listaActual.filter(v => v !== valorOpcion);
                                            }
                                            setFormData({ ...formData, [campo.llave]: nuevaLista });
                                        }}
                                    />
                                    <span className="text-slate-700">{textoOpcion}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <TarjetaPagina 
            titulo={titulo}
            izquierda={<BotonVolver fallback={rutaVolver} />}
        >
            <form onSubmit={manejarEnvio} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {esquema.map((campo, index) => (
                        <div key={index} className={campo.anchoCompleto ? "md:col-span-2" : ""}>
                            <Campo 
                                etiqueta={campo.etiqueta} 
                                pista={campo.pista}
                            >
                                {renderizarInput(campo)}
                            </Campo>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-6 mt-8">
                    <button
                        type="submit"
                        className="rounded-md bg-[#7a1e1e] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5e1717] transition-colors"
                    >
                        Guardar Datos
                    </button>
                </div>
            </form>
        </TarjetaPagina>
    );
}