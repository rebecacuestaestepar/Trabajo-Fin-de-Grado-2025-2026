import { useState } from "react";
import ItemMenu from "./ItemMenu";
import SeccionMenu from "./SeccionMenu";
import RequierePermiso from "../../auth/RequierePermiso";

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
    <RequierePermiso permisos={["view_menu"]}>
      <aside
        className={[
          "bg-[#7a1e1e] text-white transition-all duration-200",
          abierto ? "w-64" : "w-0 overflow-hidden",
        ].join(" ")}
      >
        <nav className="pt-2">
          <RequierePermiso permisos={["view_reserva", "add_reservaperiodica", "view_reservapuntual"]} condicion="alguno">
            <SeccionMenu
              titulo="Reservas"
              level={0}
              abierta={!!estados["reservas"]}
              alAlternar={() => toggle("reservas")}
            >
              <RequierePermiso permisos={["view_reserva", "view_reservapuntual"]} condicion="alguno">
                <SeccionMenu
                  titulo="Reservas puntuales"
                  level={1}
                  abierta={!!estados["puntuales"]}
                  alAlternar={() => toggle("puntuales", "reservas")}
                >
                  
                  <ItemMenu a="/reservas/gestion" level={2}>Gestionar Reservas</ItemMenu>
                  <ItemMenu a="/reservas/solicitud" level={2}>Solicitar reserva</ItemMenu>
                  
                </SeccionMenu>
              </RequierePermiso>
              
              <RequierePermiso permisos={["add_reservaperiodica"]}>
                <SeccionMenu 
                titulo="Reservas periódicas" 
                level={1}
                abierta={!!estados["periodicas"]}
                alAlternar={() => toggle("periodicas", "reservas")}
                >
                  <ItemMenu a="/reservas/periodicas/crear" level={2}>Crear Reserva Periódica</ItemMenu>
                </SeccionMenu>
              </RequierePermiso>
                
            </SeccionMenu>
          </RequierePermiso>
          <RequierePermiso permisos={["view_reservaperiodica"]}>
            <ItemMenu a="/horarios" level={0}>Horarios</ItemMenu>
          </RequierePermiso>
          <RequierePermiso permisos={["view_curso"]}>
            <ItemMenu a="/calendario/cursos" level={0}>Calendarios</ItemMenu>
          </RequierePermiso>

          <RequierePermiso permisos={["view_ocupacion_aula"]}>
            <SeccionMenu
              titulo="Ocupación de aulas"
              level={0}
              abierta={!!estados["aulas"]}
              alAlternar={() => toggle("aulas")}
            >
              <ItemMenu a="/ocupacion-aulas" level={1}>Campus Río Vena</ItemMenu>

              <ItemMenu a="/" level={1}>Campus Milanera</ItemMenu>
            </SeccionMenu>
          </RequierePermiso>

          <RequierePermiso permisos={["view_admin_panel"]}>
            <SeccionMenu
              titulo="Administración"
              level={0}
              abierta={!!estados["admin"]}
              alAlternar={() => toggle("admin")}
            >
              <ItemMenu a="/admin/aulas" level={1}>Aulas</ItemMenu>
              <ItemMenu a="/admin/grados" level={1}>Grados</ItemMenu>
              <ItemMenu a="/admin/asignaturas" level={1}>Asignaturas</ItemMenu>
              <ItemMenu a="/admin/grupos" level={1}>Grupos</ItemMenu>
              <ItemMenu a="/admin/docentes" level={1}>Docentes</ItemMenu>
              <ItemMenu a="/admin/responsables" level={1}>Responsables</ItemMenu>
              <ItemMenu a="/admin/imparte" level={1}>Asignaciones</ItemMenu>
              <ItemMenu a="/admin/usuarios" level={1}>Usuarios</ItemMenu>
              <ItemMenu a="/admin/roles" level={1}>Roles</ItemMenu>
            </SeccionMenu>
          </RequierePermiso>
        </nav>
      </aside>
    </RequierePermiso>
  );
}
