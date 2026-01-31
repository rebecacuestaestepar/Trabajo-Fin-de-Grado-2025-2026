import TarjetaReserva from "./TarjetaReservas";

export default function ListaReservas({
  reservas = [],
  idsSeleccionados = new Set(),
  alAlternarSeleccionUno,

  mostrarAceptarRechazar = false,
  mostrarEliminar = false,
  mostrarEstado = false,

  alAceptar,
  alRechazar,
  alEliminar,
  alEditar,
}) {
  return (
    <ul className="mt-6 space-y-4">
      {reservas.map((r) => {
        const id = r.id ?? r.idreserva;

        return (
          <TarjetaReserva
            key={id}
            reserva={r}
            estaSeleccionada={idsSeleccionados.has(id)}
            alAlternarSeleccion={() => alAlternarSeleccionUno?.(id)}
            mostrarAceptarRechazar={mostrarAceptarRechazar}
            mostrarEliminar={mostrarEliminar}
            mostrarEstado={mostrarEstado}
            alAceptar={alAceptar}
            alRechazar={alRechazar}
            alEliminar={alEliminar}
            alEditar={alEditar}
          />
        );
      })}
    </ul>
  );
}
