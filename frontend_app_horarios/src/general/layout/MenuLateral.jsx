import { useState } from "react";
import ItemMenu from "./ItemMenu";
import SeccionMenu from "./SeccionMenu";
import { useAulas } from "../hooks/useAulas";

export default function MenuLateral({ abierto }) {
  const [seccionAulasAbierta, setSeccionAulasAbierta] = useState(false);
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
        <ItemMenu a="/horarios">Horarios</ItemMenu>

        <SeccionMenu
          titulo="Ocupación de aulas"
          abierta={seccionAulasAbierta}
          alAlternar={() => setSeccionAulasAbierta((v) => !v)}
        >
          <ItemMenu a="/ocupacion-aulas">Ver ocupación</ItemMenu>

          <div className="px-2 pb-2">
            {cargando && (
              <div className="px-2 py-2 text-sm opacity-80">
                Cargando aulas…
              </div>
            )}

            {error && (
              <div className="px-2 py-2 text-sm opacity-90">Error: {error}</div>
            )}

            {!cargando &&
              !error &&
              aulas?.map((aula) => {
                //const id = aula.id ?? aula.idAula;
                const nombre = String(aula?.nombre ?? "").trim();

                return (
                  <ItemMenu key={nombre} a={`/ocupacion-aulas/${nombre}`}>
                    <span className="normal-case font-medium">{nombre}</span>
                  </ItemMenu>
                );
              })}
          </div>
        </SeccionMenu>

        <ItemMenu a="/examenes">Exámenes</ItemMenu>
      </nav>
    </aside>
  );
}
