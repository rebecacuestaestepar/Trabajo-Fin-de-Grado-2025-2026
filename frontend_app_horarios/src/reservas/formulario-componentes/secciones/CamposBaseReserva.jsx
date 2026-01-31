import { Campo } from '../ui/Campo.jsx';
import { AreaTexto, EntradaTexto } from '../ui/Inputs.jsx';

export default function CamposBaseReserva({
  formulario,
  alCambiar, // (patch) -> alCambiar({ campo: valor })
  soloLectura = {}, // { idreserva: true, estado: true, ... }
  mostrarId = false,
  mostrarEstado = false,
}) {
  return (
    <div className="space-y-4">
      {mostrarId && (
        <Campo etiqueta="ID Reserva">
          <EntradaTexto value={formulario.idreserva || ""} disabled readOnly />
        </Campo>
      )}

      <Campo etiqueta="Correo responsable">
        <EntradaTexto
          type="email"
          value={formulario.correo_responsable || ""}
          onChange={(e) => alCambiar({ correo_responsable: e.target.value })}
          required
          disabled={!!soloLectura.correo_responsable}
        />
      </Campo>

      <Campo etiqueta="Motivo">
        <AreaTexto
          value={formulario.motivo || ""}
          onChange={(e) => alCambiar({ motivo: e.target.value })}
          rows={3}
          placeholder="Describe brevemente el motivo…"
          disabled={!!soloLectura.motivo}
        />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo etiqueta="Fecha">
          <EntradaTexto
            type="date"
            value={formulario.fecha || ""}
            onChange={(e) => alCambiar({ fecha: e.target.value })}
            required
            disabled={!!soloLectura.fecha}
          />
        </Campo>

        <Campo etiqueta="Capacidad solicitada">
          <EntradaTexto
            type="number"
            min={0}
            value={formulario.capacidad_solicitada ?? ""}
            onChange={(e) =>
              alCambiar({ capacidad_solicitada: e.target.value })
            }
            required
            disabled={!!soloLectura.capacidad_solicitada}
          />
        </Campo>

        <Campo etiqueta="Hora inicio">
          <EntradaTexto
            type="time"
            value={formulario.hora_inicio || ""}
            onChange={(e) => alCambiar({ hora_inicio: e.target.value })}
            required
            disabled={!!soloLectura.hora_inicio}
          />
        </Campo>

        <Campo etiqueta="Hora fin">
          <EntradaTexto
            type="time"
            value={formulario.hora_fin || ""}
            onChange={(e) => alCambiar({ hora_fin: e.target.value })}
            required
            disabled={!!soloLectura.hora_fin}
          />
        </Campo>

        <Campo etiqueta="Nº ordenadores">
          <EntradaTexto
            type="number"
            min={0}
            value={formulario.num_ordenadores ?? ""}
            onChange={(e) => alCambiar({ num_ordenadores: e.target.value })}
            placeholder="Opcional"
            disabled={!!soloLectura.num_ordenadores}
          />
        </Campo>

        {mostrarEstado && (
          <Campo etiqueta="Estado">
            <EntradaTexto value={formulario.estado || ""} disabled readOnly />
          </Campo>
        )}
      </div>
    </div>
  );
}