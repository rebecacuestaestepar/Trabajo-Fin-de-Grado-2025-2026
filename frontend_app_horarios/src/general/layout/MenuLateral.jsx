import { useState } from "react";
import ItemMenu from "./ItemMenu";
import SeccionMenu from "./SeccionMenu";

export default function MenuLateral({ abierto }) {


  const [estados, setEstados] = useState({});

  const toggle = (id, parentId = null) => {
    setEstados((prev) => {
      const nuevoEstado = { ...prev };


      if (!parentId) {
        Object.keys(nuevoEstado).forEach(key => {
          nuevoEstado[key] = false;
        });
      }

      nuevoEstado[id] = !prev[id];
      return nuevoEstado;
    });
  };

  return (
    <aside
      className={[
        "bg-[#7a1e1e] text-white transition-all duration-200",
        abierto ? "w-64" : "w-0 overflow-hidden",
      ].join(" ")}
    >
      <nav className="pt-2">
        <SeccionMenu
          titulo="Reservas"
          level={0}
          abierta={!!estados["reservas"]}
          alAlternar={() => toggle("reservas")}
        >
          <SeccionMenu
            titulo="Reservas puntuales"
            level={1}
            abierta={!!estados["puntuales"]}
            alAlternar={() => toggle("puntuales", "reservas")}
          >
            <ItemMenu a="/reservas/gestion" level={2}>Gestionar Reservas</ItemMenu>
            <ItemMenu a="/reservas/solicitud" level={2}>Solicitar reserva</ItemMenu>
          </SeccionMenu>
          <SeccionMenu titulo="Reservas periódicas" level={1}> </SeccionMenu>
        </SeccionMenu>
        <ItemMenu a="/horarios" level={0}>Horarios</ItemMenu>
        <ItemMenu a="/calendario/cursos" level={0}>Calendarios</ItemMenu>

        <SeccionMenu
          titulo="Ocupación de aulas"
          level={0}
          abierta={!!estados["aulas"]}
          alAlternar={() => toggle("aulas")}
        >
          <ItemMenu a="/ocupacion-aulas" level={1}>Campus Río Vena</ItemMenu>

          <ItemMenu a="/" level={1}>Campus Milanera</ItemMenu>
        </SeccionMenu>

        <ItemMenu a="/examenes" level={0}>Exámenes</ItemMenu>
      </nav>
    </aside>
  );
}
