import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Paginador from '../../reservas/listado-componentes/secciones/Paginador';
import CabeceraTabla from '../componentes/CabeceraTabla';
import PanelBuscador from '../componentes/PanelBuscador';
import TablaDinamica from '../componentes/TablaDinamica';

export default function VistaTablaAdministrador({ 
    titulo, 
    columnas, 
    datos, 
    rutaCrear, 
    onEditar, 
    onEliminar,
    onExportar,
    onDescargarPlantilla,
    onImportar
}) {
    const navigate = useNavigate();
    
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(true);
    const [page, setPage] = useState(0); 
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const datosFiltrados = useMemo(() => {
        setPage(0); 
        if (!busqueda) return datos;

        const busquedaMinuscula = busqueda.toLowerCase();
        return datos.filter(fila => {
            return Object.values(fila).some(valor => 
                String(valor).toLowerCase().includes(busquedaMinuscula)
            );
        });
    }, [datos, busqueda]);

    const datosPaginados = useMemo(() => {
        const indiceInicio = page * rowsPerPage;
        return datosFiltrados.slice(indiceInicio, indiceInicio + rowsPerPage);
    }, [datosFiltrados, page, rowsPerPage]);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8">
            <div className="mx-auto w-full max-w-6xl">
                
                <CabeceraTabla 
                    titulo={titulo}
                    mostrarFiltros={mostrarFiltros}
                    alAlternarFiltros={() => setMostrarFiltros(!mostrarFiltros)}
                    alCrear={() => navigate(rutaCrear)}
                    alExportar={onExportar}
                    alDescargarPlantilla={onDescargarPlantilla}
                    alImportar={onImportar}
                />

                <PanelBuscador 
                    mostrar={mostrarFiltros}
                    busqueda={busqueda}
                    alCambiarBusqueda={setBusqueda}
                    alLimpiar={() => setBusqueda('')}
                />

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <TablaDinamica 
                        columnas={columnas}
                        datos={datosPaginados}
                        onEditar={onEditar}
                        onEliminar={onEliminar}
                    />

                    <div className="border-t border-slate-200">
                        <Paginador 
                            count={datosFiltrados.length}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onChangePage={(e, newPage) => setPage(newPage)}
                            onChangeRowsPerPage={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}