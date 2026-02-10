import { useState } from "react";
import { Outlet } from "react-router-dom";
import BarraSuperior from "./BarraSuperior";
import MenuLateral from "./MenuLateral";

export default function PlantillaApp() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <BarraSuperior alAlternarMenu={() => setMenuAbierto((v) => !v)} />

      <div className="flex min-h-[calc(100vh-5rem)]">
        <MenuLateral abierto={menuAbierto} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
