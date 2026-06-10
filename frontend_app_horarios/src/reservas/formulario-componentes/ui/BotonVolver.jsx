import { useNavigate } from "react-router-dom";
import React from 'react';

export default function BotonVolver({
  fallback = "/reservas",
  className = "rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50",
  children = "← Volver",
}) {
  const navigate = useNavigate();

  const manejarClic = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

  return (
    <button 
            onClick={manejarClic}
            className={`flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors shadow-sm ${className}`}
        >
      {children}
    </button>
  );
}