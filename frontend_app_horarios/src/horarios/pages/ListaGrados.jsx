import React, { useState, useEffect } from "react";
import {  useParams } from "react-router-dom";
import { obtenerGradosPorCurso } from "../../api/docencia";
import ItemCurso from "../componentes/ItemCurso";
import BotonVolver from "../../reservas/formulario-componentes/ui/BotonVolver";

export default function ListaGrados() {
    const { id_curso } = useParams();

    const [grados, setGrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarGrados = async () => {

            try {
                const data = await obtenerGradosPorCurso(id_curso);
                setGrados(data);
            } catch (err) {
                console.error("Error al cargar los grados:", err);
                setError("Error al cargar los grados.");
            } finally {
                setCargando(false);
            }
        };

        cargarGrados();
    }, [id_curso]);

    if (cargando) return <div className="p-10 text-center text-slate-500">Cargando grados...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-wrap items-center gap-4 mb-8 border-b border-slate-200 pb-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Grados con docencia</h1>
                    <p className="text-slate-500 mt-1">Horario del curso académico {id_curso}</p>
                </div>
                <BotonVolver fallback="/horarios" />
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            {grados.length === 0 && !error ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500">
                    No se han encontrado grados con horarios cargados para este curso.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {grados.map((grado) => (
                        <ItemCurso
                            key={grado.idgrado}
                            idCurso={grado.idgrado}
                            titulo={grado.nombre}
                            modoNavegacion={true}
                            rutaDestino={`/horarios/${id_curso}/grados/${grado.idgrado}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}