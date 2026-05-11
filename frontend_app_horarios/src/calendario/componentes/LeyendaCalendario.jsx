import React from 'react';
import { TIPOS_DIA } from '../utiles/calendarioConfig';

export default function LeyendaCalendario() {
    return (
        <div className='flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100'>
            {Object.values(TIPOS_DIA).map((tipo) => (
                <div key={tipo.id} className='flex items-center text-sm font-medium text-slate-600'>
                    <div
                        className='w-4 h-4 mr-2 shadow-sm'
                        style={{ backgroundColor: tipo.color }}
                    ></div>
                    {tipo.label}
                </div>
            ))}
        </div>
    );
}