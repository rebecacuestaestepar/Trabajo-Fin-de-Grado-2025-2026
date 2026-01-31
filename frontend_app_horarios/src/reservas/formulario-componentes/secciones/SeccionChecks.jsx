import TarjetaChecks from "../ui/TarjetaChecks";

export default function SeccionChecks({ formulario, alCambiar, deshabilitado = false }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">
        Recursos solicitados
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TarjetaChecks
          marcado={!!formulario.altavoces}
          alCambiar={(e) => alCambiar({ altavoces: e.target.checked })}
          etiqueta="Necesito altavoces"
          deshabilitado={deshabilitado}
        />

        <TarjetaChecks
          marcado={!!formulario.proyector}
          alCambiar={(e) => alCambiar({ proyector: e.target.checked })}
          etiqueta="Necesito proyector"
          deshabilitado={deshabilitado}
        />

        <TarjetaChecks
          marcado={!!formulario.camaras || !!formulario.camara}
          alCambiar={(e) =>
            alCambiar({ camaras: e.target.checked, camara: e.target.checked })
          }
          etiqueta="Necesito cámaras"
          deshabilitado={deshabilitado}
        />

        <TarjetaChecks
          marcado={!!formulario.enchufes}
          alCambiar={(e) => alCambiar({ enchufes: e.target.checked })}
          etiqueta="Necesito enchufes"
          deshabilitado={deshabilitado}
        />
      </div>
    </div>
  );
}
