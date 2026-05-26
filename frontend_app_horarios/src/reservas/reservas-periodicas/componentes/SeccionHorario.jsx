import { Campo } from "../../formulario-componentes/ui/Campo";
import { Selector } from "../../formulario-componentes/ui/Inputs";
import { SelectHora } from "../../formulario-componentes/ui/SelectHora";

export default function SeccionHorario({ formulario, alCambiar, soloLectura }) {
    return (
        <div className="space-y-4 pb-6 border-b border-slate-200">
            <Campo etiqueta="Día de la semana">
                <Selector name="diaSemana" value={formulario.diaSemana || ""} onChange={alCambiar} disabled={soloLectura} required>
                    <option value="">Seleccione un día...</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                </Selector>
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo etiqueta="Hora inicio">
                    <SelectHora 
                        value={formulario.horaInicio || ""} 
                        onChange={(e) => alCambiar({ target: { name: 'horaInicio', value: e.target.value }})} 
                        disabled={soloLectura} required 
                    />
                </Campo>
                <Campo etiqueta="Hora fin">
                    <SelectHora 
                        value={formulario.horaFin || ""} 
                        onChange={(e) => alCambiar({ target: { name: 'horaFin', value: e.target.value }})} 
                        disabled={soloLectura} required 
                    />
                </Campo>
            </div>
        </div>
    );
}