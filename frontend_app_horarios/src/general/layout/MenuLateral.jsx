import { useState } from "react";
import ItemMenu from "./ItemMenu";
import SeccionMenu from "./SeccionMenu";
import { useAulas } from "../hooks/useAulas";

export default function MenuLateral({ abierto }) {
  const [seccionAulasAbierta, setSeccionAulasAbierta] = useState(false);
  const [seccionReservasAbierta, setSeccionReservasAbierta] = useState(false);
  const [seccionReservasPuntualesAbierta, setSeccionReservasPuntualesAbierta] =useState(false);
  const { aulas, cargando, error } = useAulas();

  return (
    <aside
      className={[
        "bg-[#7a1e1e] text-white transition-all duration-200",
        abierto ? "w-64" : "w-0 overflow-hidden",
      ].join(" ")}
    >
      <nav className="pt-2">
        {/* IMPORTANTE: ajusta estas rutas a las tuyas reales */}
        <ItemMenu a="/reservas/pendientes">Reservas puntuales</ItemMenu>
        <SeccionMenu
          titulo="Reservas"
          abierta={seccionReservasAbierta}
          alAlternar={() => setSeccionReservasAbierta((v) => !v)}
        >
          <SeccionMenu
            titulo="Reservas puntuales"
            abierta={seccionReservasPuntualesAbierta}
            alAlternar={() => setSeccionReservasPuntualesAbierta((v) => !v)}
            >
            <ItemMenu a="/reservas/pendientes">Solicitudes Pendientes</ItemMenu>
            <ItemMenu a="/reservas/todas">Visualizar Reservas</ItemMenu>
            <ItemMenu a="/reservas/solicitud">Solicitar reserva</ItemMenu>
          </SeccionMenu>
          <SeccionMenu titulo="Reservas periódicas"> </SeccionMenu>
        </SeccionMenu>
        <ItemMenu a="/horarios">Horarios</ItemMenu>

        <SeccionMenu
          titulo="Ocupación de aulas"
          abierta={seccionAulasAbierta}
          alAlternar={() => setSeccionAulasAbierta((v) => !v)}
        >
          <ItemMenu a="/ocupacion-aulas">Campus Politécnica</ItemMenu>

          <ItemMenu a="/ocupacion-aulas">Campus Milanera</ItemMenu>
        </SeccionMenu>

        <ItemMenu a="/examenes">Exámenes</ItemMenu>
      </nav>
    </aside>
  );
}
