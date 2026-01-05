// src/components/ReservaPuntualForm.jsx
import { useState, useEffect } from 'react';
import { buscarAulasDisponibles, solicitarReservaPuntual } from '../api/reservas';


function SolicitudReserva() {
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [correoResponsable, setCorreoResponsable] = useState('');
  const [numOrdenadores , setNumOrdenadores] = useState('');
  const [altavoces, setAltavoces] = useState(false);
  const [proyector, setProyector] = useState(false);
  const [camaras, setCamaras] = useState(false);
  const [enchufes, setEnchufes] = useState(false);

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);


  const [esPeriodica, setEsPeriodica] = useState(false);
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState('');
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState('');
  const [diaSemanaPeriodica, setDiaSemanaPeriodica] = useState('');

  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const [cargandoAulas, setCargandoAulas] = useState(false);

  useEffect(() => {
    if (esPeriodica) {
      setFechaInicioPeriodo(fecha);
    }
  }, [fecha, esPeriodica]);

  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setCargandoAulas(true);

    const numOrdenadoresPayload =
      numOrdenadores === '' ? null : Number(numOrdenadores);

      const payload = {
        fecha: esPeriodica ? undefined : fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        capacidad_solicitada: Number(capacidad),
        num_ordenadores: numOrdenadoresPayload,
        altavoces,
        proyector,
        camaras,
        enchufes,
        generar_periodica: esPeriodica,
      };

      if (esPeriodica) {
        payload.fecha_inicio_periodo = fechaInicioPeriodo;
        payload.fecha_fin_periodo = fechaFinPeriodo;
        payload.dia_semana_periodica = Number(diaSemanaPeriodica);
      }
    
      
   try {
      const data = await buscarAulasDisponibles(payload);

      setAulasDisponibles(data.aulas || []);

      // ✅ Selecciona la primera por defecto
      if (data.aulas?.length > 0) {
        setAulaSeleccionada(data.aulas[0].nombre);
      } else {
        setAulaSeleccionada('');
      }
    } catch (error) {
      setErrores({ general: 'Error al conectar con el servidor' });
      setAulasDisponibles([]);
      setAulaSeleccionada('');
    } finally {
      setCargandoAulas(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);

    const numOrdenadoresPayload =
      numOrdenadores === '' ? null : Number(numOrdenadores);

    const payload = {
    fecha: fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    motivo: motivo,
    capacidad_solicitada: Number(capacidad),
    correo_responsable: correoResponsable,
    num_ordenadores: numOrdenadoresPayload,
    altavoces,
    proyector,
    camaras,
    enchufes,
    generar_periodica: esPeriodica,
    nombre_aula: aulaSeleccionada || "", //  aula elegida del desplegable
  };

  // Solo añadir campos periódicos si es periódica
  if (esPeriodica) {
    payload.fecha_inicio_periodo = fechaInicioPeriodo;
    payload.fecha_fin_periodo = fechaFinPeriodo;
    payload.dia_semana_periodica = Number(diaSemanaPeriodica);
  }

  try {

    const data = await solicitarReservaPuntual(payload);

    if (!response.ok) {
      setErrores(data);
    } else {
      setMensaje(data.message || 'Reserva creada correctamente');
      // limpiar formulario
      setFecha('');
      setHoraInicio('');
      setHoraFin('');
      setMotivo('');
      setCapacidad('');
      setCorreoResponsable('');
      setNumOrdenadores('');
      setAltavoces(false);
      setProyector(false);
      setCamaras(false);
      setEnchufes(false);
      setEsPeriodica(false);
      setFechaInicioPeriodo('');
      setFechaFinPeriodo('');
      setDiaSemanaPeriodica('');
      setAulasDisponibles([]);
      setAulaSeleccionada('');
    }
  } catch (error) {
    setErrores(error.data || { general: 'Error al conectar con el servidor' });
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

      <div>
        <label>Número de ordenadores:</label>
        <input
          type="number"
          value={numOrdenadores}
          onChange={(e) => setNumOrdenadores(e.target.value)}
          min={0}
        />
      </div>

      {/* Checkbox de recursos */}
      <div style={{ marginTop: '16px' }}>
        <label>
          <input
            type="checkbox"
            checked={altavoces}
            onChange={(e) => setAltavoces(e.target.checked)}
          />{' '}
          Necesito altavoces
        </label>
      </div>

      <div style={{ marginTop: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={proyector}
            onChange={(e) => setProyector(e.target.checked)}
          />{' '}
          Necesito proyector
        </label>
      </div>

      <div style={{ marginTop: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={camaras}
            onChange={(e) => setCamaras(e.target.checked)}
          />{' '}
          Necesito cámaras
        </label>
      </div>

      <div style={{ marginTop: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={enchufes}
            onChange={(e) => setEnchufes(e.target.checked)}
          />{' '}
          Necesito enchufes
        </label>
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

      <div style={{ marginTop: '16px' }}>
  <button
    type="button"
    onClick={buscarAulas}
    disabled={cargandoAulas || !fecha || !horaInicio || !horaFin || !capacidad}
  >
    {cargandoAulas ? 'Buscando aulas...' : 'Buscar aulas candidatas'}
  </button>
</div>

<div style={{ marginTop: '12px' }}>
  <label>Aula:</label>
  <select
    value={aulaSeleccionada}
    onChange={(e) => setAulaSeleccionada(e.target.value)}
    disabled={aulasDisponibles.length === 0}
  >
    {aulasDisponibles.length === 0 ? (
      <option value="">(Pulsa "Buscar aulas disponibles")</option>
    ) : (
      aulasDisponibles.map((a) => (
        <option key={a.nombre} value={a.nombre}>
          {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
        </option>
      ))
    )}
  </select>

  {aulasDisponibles.length > 0 && (
    <div style={{ marginTop: '6px' }}>
      <small>
        Por defecto se selecciona la primera aula disponible. Puedes desplegar y escoger otra.
      </small>
    </div>
  )}
  </div>


      <button type="submit" style={{ marginTop: '16px' }}>Enviar solicitud</button>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {errores && (
        <pre style={{ color: 'red' }}>{JSON.stringify(errores, null, 2)}</pre>
      )}
    </form>
  );
}

export default SolicitudReserva;
