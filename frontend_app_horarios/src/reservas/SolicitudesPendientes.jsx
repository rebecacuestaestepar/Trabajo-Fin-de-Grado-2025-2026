// src/reservas/SolicitudesPendientes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReservasPendientes } from "../api/reservas.js";

export default function SolicitudesPendientes() {
  const [pendientes, setPendientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReservasPendientes();
        setPendientes(data);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const abrirDetalle = (r) => {
    const id = r.id ?? r.idreserva; // por si el backend devuelve idreserva
    navigate(`/reservas/pendientes/${id}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Solicitudes pendientes</h1>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && pendientes.length === 0 && (
        <p>No hay solicitudes pendientes.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {pendientes.map((r) => {
          const id = r.id ?? r.idreserva;
          return (
            <li
              key={id}
              onClick={() => abrirDetalle(r)}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                padding: 14,
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              {/* SOLO motivo */}
              <div style={{ fontWeight: 600 }}>
                {r.motivo ? r.motivo : "(Sin motivo)"}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
