import React, { useState } from 'react';
import AreaArchivo from './AreaArchivo';
import { useNavigate } from 'react-router-dom';

const ItemCurso = ({ idCurso, enviarBack, modoNavegacion = false }) => {
    const [expandido, setExpandido] = useState(false);
    const navigate = useNavigate();

    const manejarClic = () => {
        if (modoNavegacion) {
            navigate(`/horarios/curso/${idCurso}`);
        } else{
            setExpandido(!expandido);
        }
    };

    return (
        <div className="border-2 border-slate-300 rounded-lg py-5 px-4 transition-colors duration-200 hover:bg-slate-50 last:border-b-0">
            <div
                className={`flex justify-between items-center cursor-pointer text-slate-800 ${
                    expandido ? 'font-bold' : 'font-normal'
                }`}
                onClick={manejarClic}
            >
                <span className="text-lg">Curso {idCurso}</span>
                {!modoNavegacion && (
                    <span className="text-slate-400 transition-transform duration-200">
                        {expandido ? '▲' : '▼'}
                    </span>
                )}
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