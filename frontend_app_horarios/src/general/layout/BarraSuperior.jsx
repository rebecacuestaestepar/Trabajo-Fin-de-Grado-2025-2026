import logoUbu from "../../assets/logoUbu.jpg";

export default function BarraSuperior({ alAlternarMenu }) {
  return (
    <header className="h-20 bg-[#7a1e1e] text-white flex items-center px-4">
      <button
        type="button"
        onClick={alAlternarMenu}
        className="mr-4 rounded-md p-2 hover:bg-[#651818]"
        aria-label="Abrir o cerrar menú"
      >
        <div className="space-y-1">
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-6 bg-white" />
        </div>
      </button>

      <div className="flex items-center gap-4">
        <img
          src={logoUbu}
          alt="Universidad de Burgos"
          className="h-14 w-14 bg-white rounded-sm object-contain p-1"
        />



        <h1 className="text-lg font-semibold tracking-wide">
          BIENVENID@ NOMBRE USUARIO
        </h1>
      </div>
    </header>
  );
}
