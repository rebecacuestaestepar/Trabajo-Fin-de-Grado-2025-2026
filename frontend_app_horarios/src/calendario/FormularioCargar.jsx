import { useState } from "react";
import { cargarCalendarioFormulario } from "../api/calendario";

function FormularioCargar() {
    const [fechaInicio1Semestre, setFechaInicio1Semestre] = useState('');
    const [fechaFin1Semestre, setFechaFin1Semestre] = useState('');
    const [fechaInicio2Semestre, setFechaInicio2Semestre] = useState('');
    const [fechaFin2Semestre, setFechaFin2Semestre] = useState('');
    //const [fechaInicio1Examenes, setFechaInicio1Examenes] = useState('');
    //const [fechaInicio2Examenes, setFechaInicio2Examenes] = useState('');
    const [semanasDocencia, setSemanasDocencia] = useState('');

    const [mensaje, setMensaje] = useState(null);
    const [errores, setErrores] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);
        setErrores(null);

        payload = {
            fecha_inicio_1_semestre: fechaInicio1Semestre,
            fecha_fin_1_semestre: fechaFin1Semestre,
            fecha_inicio_2_semestre: fechaInicio2Semestre,
            fecha_fin_2_semestre: fechaFin2Semestre,
            semanas_docencia: Number(semanasDocencia),
            //fecha_inicio_1_examenes: fechaInicio1Examenes,
            //fecha_inicio_2_examenes: fechaInicio2Examenes,
        };
    

        try {
            const data = await cargarCalendarioFormulario(payload);
            
            setMensaje(data.message || 'Fechas cargadas correctamente');

            // opcional: limpiar formulario
            setFechaInicio1Semestre('');
            setFechaFin1Semestre('');
            setFechaInicio2Semestre('');
            setFechaFin2Semestre('');
            //setFechaInicio1Examenes('');
            //setFechaInicio2Examenes('');
            setSemanasDocencia('');
            
        } catch (error) {
            setErrores(error.data || { general: 'Error al enviar el formulario' });
        }
        
    }
    return (
        <form onSubmit={handleSubmit}>
            <h1>Formulario para cargar calendario académico</h1>
            <div>
                <label>Fecha Inicio 1er Semestre:  </label>
                <input
                    type="date"
                    value={fechaInicio1Semestre}
                    onChange={(e) => setFechaInicio1Semestre(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Fecha Fin 1er Semestre:  </label>
                <input
                    type="date"
                    value={fechaFin1Semestre}
                    onChange={(e) => setFechaFin1Semestre(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Fecha Inicio 2o Semestre:  </label>
                <input
                    type="date"
                    value={fechaInicio2Semestre}
                    onChange={(e) => setFechaInicio2Semestre(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Fecha Fin 2o Semestre:  </label>
                <input
                    type="date"
                    value={fechaFin2Semestre}
                    onChange={(e) => setFechaFin2Semestre(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Semanas de docencia:  </label>
                <input 
                    type="number"
                    value={semanasDocencia}
                    onChange={(e) => setSemanasDocencia(e.target.value)}
                    required
                />
            </div>

            <button type="submit">Cargar Fechas</button>

            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {errores && (
                <div style={{ color: 'red' }}>
                    {Object.entries(errores).map(([key, value]) => (
                        <p key={key}>{key}: {value}</p>
                    ))}
                </div>
            )}
        </form>
    );  
}

export default FormularioCargar;