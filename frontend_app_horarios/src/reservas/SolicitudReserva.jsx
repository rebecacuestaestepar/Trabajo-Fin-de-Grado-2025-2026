// src/components/ReservaPuntualForm.jsx
import { useState, useEffect } from 'react';


function SolicitudReserva() {
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [correoResponsable, setCorreoResponsable] = useState('');

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);


  const [esPeriodica, setEsPeriodica] = useState(false);
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState('');
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState('');
  const [diaSemanaPeriodica, setDiaSemanaPeriodica] = useState('');

  useEffect(() => {
    if (esPeriodica) {
      setFechaInicioPeriodo(fecha);
    }
  }, [fecha, esPeriodica]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);

    try {
      const response = await fetch('http://localhost:8000/api/reservas/puntuales/solicitar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          motivo: motivo,
          capacidad_solicitada: Number(capacidad),
          correo_responsable: correoResponsable,
          generar_periodica: esPeriodica,
          fecha_inicio_periodo: fechaInicioPeriodo,
          fecha_fin_periodo: fechaFinPeriodo,
          dia_semana_periodica: diaSemanaPeriodica,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrores(data);
      } else {
        const data = await response.json();
        setMensaje(data.message || 'Reserva creada correctamente');
        // opcional: limpiar formulario
        setFecha('');
        setHoraInicio('');
        setHoraFin('');
        setMotivo('');
        setCapacidad('');
        setCorreoResponsable('');
        setEsPeriodica(false);
        setFechaInicioPeriodo('');
        setFechaFinPeriodo('');
        setDiaSemanaPeriodica('');
      }
    } catch (error) {
      setErrores({ general: 'Error al conectar con el servidor' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Solicitud de reserva puntual</h1>
      <div>
        <label>Correo responsable:</label>
        <input
          type="email"
          value={correoResponsable}
          onChange={(e) => setCorreoResponsable(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Hora inicio:</label>
        <input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Hora fin:</label>
        <input
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Capacidad solicitada:</label>
        <input
          type="number"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Motivo:</label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <label>
          <input
            type="checkbox"
            checked={esPeriodica}
            onChange={(e) => setEsPeriodica(e.target.checked)}
          />{' '}
          Generar reserva de forma periódica
        </label>
      </div>

      {esPeriodica && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <h4>Configuración de reserva periódica</h4>

          <div>
            <label>Fecha de inicio:</label>
            <input
              type="date"
              value={fechaInicioPeriodo}
              onChange={(e) => setFechaInicioPeriodo(e.target.value)}
            />
          </div>

          <div>
            <label>Fecha de fin:</label>
            <input
              type="date"
              value={fechaFinPeriodo}
              onChange={(e) => setFechaFinPeriodo(e.target.value)}
            />
          </div>

          <div>
            <label>Día de la semana que generar la reserva:</label>
            <select
              value={diaSemanaPeriodica}
              onChange={(e) => setDiaSemanaPeriodica(e.target.value)}
            >
              <option value="">Día de la semana que generar la reserva</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
            </select>
          </div>
        </div>
      )}


      <button type="submit" style={{ marginTop: '16px' }}>Enviar solicitud</button>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {errores && (
        <pre style={{ color: 'red' }}>{JSON.stringify(errores, null, 2)}</pre>
      )}
    </form>
  );
}

export default SolicitudReserva;
