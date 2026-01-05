// src/reservas/SolicitudPendienteDetalles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getReservaDetalle,
  patchReserva,
  postAulasCandidatas,
  aprobarReserva,
  rechazarReserva,
} from "../api/reservas.js";

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function SolicitudesPendientesDetalles() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReservaDetalle(id);
        setForm(data);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const keyCandidatas = useMemo(() => {
    if (!form) return null;
    return {
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      capacidad_solicitada: form.capacidad_solicitada,
      num_ordenadores: form.num_ordenadores,
      altavoces: form.altavoces,
      proyector: form.proyector,
      camaras: form.camaras,
      enchufes: form.enchufes,
    };
  }, [form]);

  const debouncedKey = useDebounced(keyCandidatas, 400);

  useEffect(() => {
    if (!debouncedKey) return;
    (async () => {
      try {
        const data = await postAulasCandidatas(id, debouncedKey);
        setAulas(data?.candidatas ?? []);
      } catch {
        setAulas([]);
      }
    })();
  }, [debouncedKey, id]);

  async function guardarCambios(parcial) {
    setSaving(true);
    setError(null);
    try {
      const updated = await patchReserva(id, parcial);
      setForm(updated);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function aprobar() {
    setSaving(true);
    setError(null);
    try {
      await aprobarReserva(id);
      // Al aprobar, vuelve al listado (y ahí ya no aparecerá)
      navigate("/reservas/pendientes");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function rechazar() {
    setSaving(true);
    setError(null);
    try {
      await rechazarReserva(id);
      navigate("/reservas/pendientes");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (!form) return <p style={{ padding: 24 }}>Sin datos.</p>;

  const aulaSeleccionada = form.nombre_aula ?? "";

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <button onClick={() => navigate("/reservas/pendientes")}>← Volver</button>

      <h1>Detalle solicitud #{id}</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {saving && <p>Guardando...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label>
          Motivo:
          <input
            type="text"
            value={form.motivo || ""}
            onChange={(e) => guardarCambios({ motivo: e.target.value })}
          />
        </label>

        <label>
          Fecha:
          <input
            type="date"
            value={form.fecha || ""}
            onChange={(e) => guardarCambios({ fecha: e.target.value })}
          />
        </label>

        <label>
          Hora inicio:
          <input
            type="time"
            value={form.hora_inicio || ""}
            onChange={(e) => guardarCambios({ hora_inicio: e.target.value })}
          />
        </label>

        <label>
          Hora fin:
          <input
            type="time"
            value={form.hora_fin || ""}
            onChange={(e) => guardarCambios({ hora_fin: e.target.value })}
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Aula (candidatas):
          <select
            value={aulaSeleccionada}
            onChange={(e) => guardarCambios({ nombre_aula: e.target.value })}
          >
            <option value="">-- Selecciona aula --</option>
            {aulas.map((a) => (
              <option key={a.nombre ?? a.id} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={aprobar} disabled={saving || !form.nombre_aula}>
          Aprobar
        </button>
        <button onClick={rechazar} disabled={saving}>
          Rechazar
        </button>
      </div>
    </div>
  );
}
