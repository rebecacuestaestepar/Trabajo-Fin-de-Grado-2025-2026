import React, { useState } from 'react';
import AreaArchivo from './AreaArchivo';
import { useNavigate } from 'react-router-dom';

const ItemCurso = ({ idCurso, enviarBack, modoNavegacion = false, rutaDestino, titulo, onEliminar}) => {
    const [expandido, setExpandido] = useState(false);
    const navigate = useNavigate();

    const manejarClic = () => {
        if (modoNavegacion) {
            navigate(rutaDestino || `/calendario/cursos/${idCurso}`);
        } else{
            setExpandido(!expandido);
        }
    };

    const manejarEliminar = (e) => {
        e.stopPropagation();
        if (onEliminar) {
            onEliminar(idCurso);
        }
    };

    const esRutaHorario = rutaDestino && rutaDestino.startsWith('/horarios');
    const textoTitulo = titulo ? titulo : (esRutaHorario ? `Horario ${idCurso}` : `Curso ${idCurso}`);

    return (
        <div className="border-2 border-slate-300 rounded-lg py-5 px-4 transition-colors duration-200 hover:bg-slate-50 last:border-b-0">
            <div
                className={`flex justify-between items-center cursor-pointer text-slate-800 ${
                    expandido ? 'font-bold' : 'font-normal'
                }`}
                onClick={manejarClic}
            >
                <span className="text-lg">{textoTitulo}</span>
                <div className="flex items-center gap-3">
                    {onEliminar && (
                        <button
                            type="button"
                            onClick={manejarEliminar}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar curso"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                    {!modoNavegacion && (
                        <span className="text-slate-400 transition-transform duration-200">
                            {expandido ? '▲' : '▼'}
                        </span>
                    )}
                </div>
            </div>
        
            {expandido && !modoNavegacion && (
                <div className="animate-fade-in">
                    <AreaArchivo
                        idCurso={idCurso}
                        onArchivoSeleccionado={enviarBack}
                    />
                </div>
            )}
        </div>
    );
};

export default ItemCurso;