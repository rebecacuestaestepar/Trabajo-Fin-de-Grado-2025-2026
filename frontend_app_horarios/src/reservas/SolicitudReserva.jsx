// src/components/ReservaPuntualForm.jsx
import { useState } from 'react';

function SolicitudReserva() {
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [correoResponsable, setCorreoResponsable] = useState('');

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);

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
      }
    } catch (error) {
      setErrores({ general: 'Error al conectar con el servidor' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <button type="submit">Enviar solicitud</button>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {errores && (
        <pre style={{ color: 'red' }}>{JSON.stringify(errores, null, 2)}</pre>
      )}
    </form>
  );
}

export default SolicitudReserva;
